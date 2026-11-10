import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPECIAL_CELLS } from './src/data/specialCells.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// Interface for server-authoritative online room
interface ServerPlayer {
  id: number;
  socketId: string;
  name: string;
  characterId: string;
  isHost: boolean;
  isReady: boolean;
  pos: number;
  prevPos: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  missTurns: number;
  extraRolls: number;
  finishedRank: number | null;
  clashWins: number;
  buffs: {
    shieldTurns: number;
    doubleRollNext: boolean;
    reflectTurns: number;
    precisionChoice: boolean;
  };
  abilityCooldowns: Record<string, number>;
}

interface ServerRoom {
  code: string;
  status: 'lobby' | 'playing' | 'victory';
  hostSocketId: string;
  players: ServerPlayer[];
  currentPlayerIndex: number;
  rankCounter: number;
  diceValue: number | null;
  isTurnBusy: boolean;
  clashData: any | null;
  winner: ServerPlayer | null;
  lastAction?: {
    type: string;
    playerId: number;
    description: string;
  };
  createdAt: number;
  lastActivity: number;
}

const rooms = new Map<string, ServerRoom>();
const clientSockets = new Map<string, WebSocket>();
const socketToRoom = new Map<string, string>();

const CODE_WORDS = ['STAND', 'ARROW', 'HAMON', 'WRYYY', 'DIO88', 'SPEED', 'STAR7', 'GOLD1', 'STONE', 'RUSH4'];

function generateRoomCode(): string {
  const base = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
  const num = Math.floor(10 + Math.random() * 89);
  const code = `${base}${num}`;
  return rooms.has(code) ? generateRoomCode() : code;
}

function broadcastRoom(room: ServerRoom, type: string, extraData: any = {}) {
  const payload = JSON.stringify({
    type,
    room,
    ...extraData,
    timestamp: Date.now(),
  });

  room.players.forEach((p) => {
    const ws = clientSockets.get(p.socketId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

function sendToSocket(ws: WebSocket, type: string, data: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...data, timestamp: Date.now() }));
  }
}

// Cleanup stale rooms older than 3 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, r] of rooms.entries()) {
    if (now - r.lastActivity > 3 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 15 * 60 * 1000);

wss.on('connection', (ws) => {
  const socketId = Math.random().toString(36).substring(2, 11);
  clientSockets.set(socketId, ws);

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { action } = data;

      switch (action) {
        case 'ping': {
          sendToSocket(ws, 'pong', {});
          break;
        }

        case 'create_room': {
          const playerName = (data.name || 'Crusader').trim().slice(0, 14);
          const characterId = data.characterId || 'jotaro';
          const roomCode = generateRoomCode();

          const newPlayer: ServerPlayer = {
            id: 1,
            socketId,
            name: playerName,
            characterId,
            isHost: true,
            isReady: true,
            pos: 1,
            prevPos: 1,
            hp: 100,
            maxHp: 100,
            sp: 50,
            maxSp: 100,
            missTurns: 0,
            extraRolls: 0,
            finishedRank: null,
            clashWins: 0,
            buffs: {
              shieldTurns: 0,
              doubleRollNext: false,
              reflectTurns: 0,
              precisionChoice: false,
            },
            abilityCooldowns: {},
          };

          const newRoom: ServerRoom = {
            code: roomCode,
            status: 'lobby',
            hostSocketId: socketId,
            players: [newPlayer],
            currentPlayerIndex: 0,
            rankCounter: 1,
            diceValue: null,
            isTurnBusy: false,
            clashData: null,
            winner: null,
            createdAt: Date.now(),
            lastActivity: Date.now(),
          };

          rooms.set(roomCode, newRoom);
          socketToRoom.set(socketId, roomCode);

          sendToSocket(ws, 'room_created', {
            code: roomCode,
            room: newRoom,
            myPlayerId: 1,
          });
          break;
        }

        case 'join_room': {
          const rawCode = (data.code || '').trim().toUpperCase();
          const playerName = (data.name || 'Stand User').trim().slice(0, 14);
          const characterId = data.characterId || 'dio';

          const room = rooms.get(rawCode);
          if (!room) {
            sendToSocket(ws, 'error', { message: `Room "${rawCode}" does not exist or has expired.` });
            return;
          }

          if (room.status !== 'lobby') {
            sendToSocket(ws, 'error', { message: `Room "${rawCode}" is already in an active battle.` });
            return;
          }

          if (room.players.length >= 4) {
            sendToSocket(ws, 'error', { message: `Room "${rawCode}" is already full (maximum 4 players).` });
            return;
          }

          const existingIds = new Set(room.players.map((p) => p.id));
          let nextId = 1;
          while (existingIds.has(nextId)) nextId++;

          const newPlayer: ServerPlayer = {
            id: nextId,
            socketId,
            name: playerName,
            characterId,
            isHost: false,
            isReady: false,
            pos: 1,
            prevPos: 1,
            hp: 100,
            maxHp: 100,
            sp: 50,
            maxSp: 100,
            missTurns: 0,
            extraRolls: 0,
            finishedRank: null,
            clashWins: 0,
            buffs: {
              shieldTurns: 0,
              doubleRollNext: false,
              reflectTurns: 0,
              precisionChoice: false,
            },
            abilityCooldowns: {},
          };

          room.players.push(newPlayer);
          room.lastActivity = Date.now();
          socketToRoom.set(socketId, rawCode);

          sendToSocket(ws, 'room_joined', {
            code: rawCode,
            room,
            myPlayerId: nextId,
          });

          broadcastRoom(room, 'player_joined', {
            joinedPlayerName: playerName,
          });
          break;
        }

        case 'select_character': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || room.status !== 'lobby') return;

          const player = room.players.find((p) => p.socketId === socketId);
          if (!player) return;

          player.characterId = data.characterId || player.characterId;
          room.lastActivity = Date.now();
          broadcastRoom(room, 'room_updated');
          break;
        }

        case 'toggle_ready': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || room.status !== 'lobby') return;

          const player = room.players.find((p) => p.socketId === socketId);
          if (!player) return;

          player.isReady = !player.isReady;
          room.lastActivity = Date.now();
          broadcastRoom(room, 'room_updated');
          break;
        }

        case 'start_game': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || room.status !== 'lobby') return;

          if (room.hostSocketId !== socketId) {
            sendToSocket(ws, 'error', { message: 'Only the room host can commence the match.' });
            return;
          }

          if (room.players.length < 2) {
            sendToSocket(ws, 'error', { message: 'Invite at least 1 more friend to start the match.' });
            return;
          }

          room.status = 'playing';
          room.currentPlayerIndex = 0;
          room.rankCounter = 1;
          room.isTurnBusy = false;
          room.lastActivity = Date.now();

          broadcastRoom(room, 'game_started');
          break;
        }

        case 'roll_dice': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || room.status !== 'playing' || room.isTurnBusy) return;

          const activePlayer = room.players[room.currentPlayerIndex];
          if (!activePlayer || activePlayer.socketId !== socketId || activePlayer.finishedRank !== null) {
            return;
          }

          room.isTurnBusy = true;
          const rolledVal = Math.floor(Math.random() * 6) + 1;
          room.diceValue = rolledVal;

          broadcastRoom(room, 'dice_rolled', {
            val: rolledVal,
            rollerId: activePlayer.id,
            rollerName: activePlayer.name,
          });

          // Server-authoritative movement calculation
          setTimeout(() => {
            const startPos = activePlayer.pos;
            let endPos = startPos + rolledVal;
            const maxGoal = 100;

            if (endPos > maxGoal) {
              const overshoot = endPos - maxGoal;
              endPos = Math.max(1, maxGoal - overshoot);
            }

            activePlayer.prevPos = startPos;
            activePlayer.pos = endPos;

            // Check for special tile
            const special = (SPECIAL_CELLS as any)[endPos];
            let destinationPos: number | null = null;
            let specialLabel = '';
            let isHazard = false;

            if (special) {
              specialLabel = special.effectLabel || special.name;
              isHazard = !!special.isHazard;

              if (isHazard && activePlayer.buffs.shieldTurns > 0) {
                // Shield neutralized trap!
                activePlayer.buffs.shieldTurns = Math.max(0, activePlayer.buffs.shieldTurns - 1);
                specialLabel = 'Neutralized by Hamon Shield!';
              } else {
                if (isHazard) {
                  activePlayer.hp = Math.max(15, activePlayer.hp - 20);
                }

                if (special.targetCell) {
                  destinationPos = Math.min(100, Math.max(1, special.targetCell));
                } else if (special.moveOffset) {
                  destinationPos = Math.min(100, Math.max(1, endPos + special.moveOffset));
                }

                // Handle unique tile stats
                if (endPos === 5) {
                  activePlayer.hp = Math.min(activePlayer.maxHp, activePlayer.hp + 35);
                  activePlayer.sp = Math.min(activePlayer.maxSp, activePlayer.sp + 20);
                } else if (endPos === 15) {
                  activePlayer.missTurns += 2;
                } else if (endPos === 18) {
                  activePlayer.sp = Math.min(activePlayer.maxSp, activePlayer.sp + 30);
                  activePlayer.buffs.shieldTurns += 2;
                  activePlayer.extraRolls += 1;
                } else if (endPos === 28) {
                  activePlayer.extraRolls += 2;
                  activePlayer.sp = Math.min(activePlayer.maxSp, activePlayer.sp + 25);
                } else if (endPos === 38 || endPos === 42) {
                  activePlayer.extraRolls += 1;
                  activePlayer.sp = Math.min(activePlayer.maxSp, activePlayer.sp + 20);
                } else if (endPos === 45 || endPos === 80) {
                  activePlayer.missTurns += 1;
                } else if (endPos === 88) {
                  activePlayer.missTurns = 0;
                  activePlayer.buffs.shieldTurns = 2;
                } else if (endPos === 90) {
                  activePlayer.sp = Math.min(activePlayer.maxSp, activePlayer.sp + 40);
                } else if (endPos === 98) {
                  activePlayer.extraRolls += 2;
                }
              }
            }

            const finalPawnPos = destinationPos !== null ? destinationPos : endPos;

            // Check if player reached Goal (Tile 100)
            if (finalPawnPos === 100 && activePlayer.finishedRank === null) {
              activePlayer.finishedRank = room.rankCounter;
              room.rankCounter++;
            }

            // Check for Stand Clash with other active rivals on the same landing tile
            const rivalsOnTile = room.players.filter(
              (r) => r.id !== activePlayer.id && r.finishedRank === null && r.pos === finalPawnPos
            );

            if (rivalsOnTile.length > 0 && destinationPos === null) {
              const defender = rivalsOnTile[0];
              room.clashData = {
                attackerId: activePlayer.id,
                defenderId: defender.id,
                attackerScore: 50,
                defenderScore: 50,
                timeLeft: 4.0,
                winnerId: null,
              };
            }

            activePlayer.pos = finalPawnPos;

            broadcastRoom(room, 'player_moved', {
              playerId: activePlayer.id,
              fromPos: startPos,
              intermediatePos: endPos,
              finalPos: finalPawnPos,
              specialTile: special ? {
                name: special.name,
                label: specialLabel,
                isHazard,
                destinationPos,
              } : null,
              clashData: room.clashData,
            });

            // If a clash was triggered, wait for clash resolution before advancing turn
            if (!room.clashData) {
              setTimeout(() => {
                advanceOnlineTurn(room, activePlayer);
              }, destinationPos ? 2200 : 1200);
            }
          }, 1200);
          break;
        }

        case 'clash_tap': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || !room.clashData) return;

          const player = room.players.find((p) => p.socketId === socketId);
          if (!player) return;

          if (player.id === room.clashData.attackerId) {
            room.clashData.attackerScore = Math.min(100, (room.clashData.attackerScore || 50) + 3);
          } else if (player.id === room.clashData.defenderId) {
            room.clashData.defenderScore = Math.min(100, (room.clashData.defenderScore || 50) + 3);
          }

          broadcastRoom(room, 'clash_sync', {
            attackerScore: room.clashData.attackerScore,
            defenderScore: room.clashData.defenderScore,
          });
          break;
        }

        case 'resolve_clash': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || !room.clashData) return;

          const { winnerId } = data;
          const attacker = room.players.find((p) => p.id === room.clashData.attackerId);
          const defender = room.players.find((p) => p.id === room.clashData.defenderId);

          if (attacker && defender) {
            const winP = winnerId === attacker.id ? attacker : defender;
            const loseP = winnerId === attacker.id ? defender : attacker;

            winP.sp = Math.min(winP.maxSp, winP.sp + 25);
            winP.clashWins += 1;
            loseP.pos = Math.max(1, loseP.pos - 3);
            loseP.hp = Math.max(10, loseP.hp - 20);

            broadcastRoom(room, 'clash_resolved', {
              winnerId: winP.id,
              winnerName: winP.name,
              loserId: loseP.id,
              loserName: loseP.name,
            });
          }

          room.clashData = null;
          const activeP = room.players[room.currentPlayerIndex];
          setTimeout(() => {
            if (activeP) advanceOnlineTurn(room, activeP);
          }, 1500);
          break;
        }

        case 'use_ability': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room || room.status !== 'playing' || room.isTurnBusy) return;

          const player = room.players.find((p) => p.socketId === socketId);
          if (!player || player.id !== room.players[room.currentPlayerIndex]?.id) return;

          const { abilityId, spCost } = data;
          if (player.sp < (spCost || 25)) return;

          player.sp -= (spCost || 25);
          player.abilityCooldowns[abilityId] = 2;

          broadcastRoom(room, 'ability_used', {
            playerId: player.id,
            playerName: player.name,
            abilityId,
          });
          break;
        }

        case 'send_taunt': {
          const roomCode = socketToRoom.get(socketId);
          if (!roomCode) return;
          const room = rooms.get(roomCode);
          if (!room) return;

          const player = room.players.find((p) => p.socketId === socketId);
          if (!player) return;

          broadcastRoom(room, 'player_taunt', {
            playerId: player.id,
            playerName: player.name,
            characterId: player.characterId,
            message: (data.message || 'ORA!').slice(0, 40),
          });
          break;
        }

        case 'leave_room': {
          handleDisconnect(socketId);
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    handleDisconnect(socketId);
  });
});

function advanceOnlineTurn(room: ServerRoom, lastPlayer: ServerPlayer) {
  // Check victory condition
  const activeRemaining = room.players.filter((p) => p.finishedRank === null);
  if (activeRemaining.length <= 1) {
    if (activeRemaining.length === 1) {
      activeRemaining[0].finishedRank = room.rankCounter;
    }
    const sorted = [...room.players].sort((a, b) => (a.finishedRank || 99) - (b.finishedRank || 99));
    room.winner = sorted[0];
    room.status = 'victory';
    broadcastRoom(room, 'game_victory', { winner: sorted[0] });
    return;
  }

  // Extra roll check
  if (lastPlayer.extraRolls > 0 && lastPlayer.finishedRank === null) {
    lastPlayer.extraRolls--;
    room.isTurnBusy = false;
    broadcastRoom(room, 'extra_roll_awarded', {
      playerId: lastPlayer.id,
      playerName: lastPlayer.name,
    });
    return;
  }

  // Advance to next active player
  let candidate = (room.currentPlayerIndex + 1) % room.players.length;
  let looped = 0;
  while (room.players[candidate].finishedRank !== null && looped < room.players.length) {
    candidate = (candidate + 1) % room.players.length;
    looped++;
  }

  const nextP = room.players[candidate];

  // Handle missed turn
  if (nextP.missTurns > 0) {
    nextP.missTurns--;
    nextP.sp = Math.min(nextP.maxSp, nextP.sp + 15);
    nextP.hp = Math.min(nextP.maxHp, nextP.hp + 10);
    broadcastRoom(room, 'turn_skipped', {
      playerId: nextP.id,
      playerName: nextP.name,
      remainingMisses: nextP.missTurns,
    });
    setTimeout(() => {
      advanceOnlineTurn(room, nextP);
    }, 1500);
    return;
  }

  // Turn start energy recovery
  nextP.sp = Math.min(nextP.maxSp, nextP.sp + 10);
  nextP.buffs.shieldTurns = Math.max(0, nextP.buffs.shieldTurns - 1);
  Object.keys(nextP.abilityCooldowns).forEach((k) => {
    if (nextP.abilityCooldowns[k] > 0) nextP.abilityCooldowns[k]--;
  });

  room.currentPlayerIndex = candidate;
  room.isTurnBusy = false;

  broadcastRoom(room, 'turn_changed', {
    currentPlayerIndex: candidate,
    activePlayerId: nextP.id,
    activePlayerName: nextP.name,
  });
}

function handleDisconnect(socketId: string) {
  const roomCode = socketToRoom.get(socketId);
  clientSockets.delete(socketId);
  socketToRoom.delete(socketId);

  if (!roomCode) return;
  const room = rooms.get(roomCode);
  if (!room) return;

  const departingPlayer = room.players.find((p) => p.socketId === socketId);
  room.players = room.players.filter((p) => p.socketId !== socketId);

  if (room.players.length === 0) {
    rooms.delete(roomCode);
    return;
  }

  // If host disconnected, promote first remaining player to host
  if (room.hostSocketId === socketId) {
    room.hostSocketId = room.players[0].socketId;
    room.players[0].isHost = true;
  }

  // Adjust current turn index if necessary
  if (room.currentPlayerIndex >= room.players.length) {
    room.currentPlayerIndex = 0;
  }

  broadcastRoom(room, 'player_left', {
    departedName: departingPlayer?.name || 'A player',
  });
}

// REST endpoints for health check & quick room lookup
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
});

app.get('/api/rooms/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  return res.json({
    code: room.code,
    status: room.status,
    playerCount: room.players.length,
    maxPlayers: 4,
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProd) {
    // Mount Vite dev server middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[JoJo Online Server] Listening on port ${port} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
