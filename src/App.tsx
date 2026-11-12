import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Character,
  GameMode,
  DiceMode,
  ViewMode,
  Player,
  StandAbility,
  ActionBannerData,
  LogEntry,
  DangerAheadInfo,
  StanceType,
  StandClashData,
  AiDifficulty,
} from './types/game';
import { CHARACTERS } from './data/characters';
import { SPECIAL_CELLS } from './data/specialCells';
import { sound, SoundscapeZone, LOCATION_ZONES, getZoneForCell } from './services/audio';
import { ThreeBoard } from './components/ThreeBoard';
import { Tactical2DBoard } from './components/Tactical2DBoard';
import { ActionBanner } from './components/ActionBanner';
import { StandCardsDock } from './components/StandCardsDock';
import { GameHUD } from './components/GameHUD';
import { MenuScreens } from './components/MenuScreens';
import { StandClashModal } from './components/StandClashModal';
import { MoveSticker } from './components/MoveSticker';
import { SettingsModal } from './components/SettingsModal';
import { CharacterVoiceCallout } from './components/CharacterVoiceCallout';
import { characterVoiceAudio } from './services/characterVoiceAudio';
import { CharacterVoiceLine, DialogueTrigger } from './data/characterVoiceLines';
import { StandActivationVFX, StandVFXData } from './components/StandActivationVFX';
import { ExitWarningModal } from './components/ExitWarningModal';
import { LoadingScreen } from './components/LoadingScreen';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { onlineService } from './services/onlineMultiplayer';
import { OnlineRoomState } from './types/game';

export default function App() {
  const [screen, setScreen] = useState<
    'menu' | 'character-select' | 'rules' | 'loading' | 'playing' | 'paused' | 'victory'
  >('menu');
  const [isExitWarningOpen, setIsExitWarningOpen] = useState<boolean>(false);
  const [isOnlineLobbyOpen, setIsOnlineLobbyOpen] = useState<boolean>(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [myOnlinePlayerId, setMyOnlinePlayerId] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [diceMode, setDiceMode] = useState<DiceMode>('auto');
  const [viewMode, setViewMode] = useState<ViewMode>('3d-action');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentZone, setCurrentZone] = useState<SoundscapeZone>('cairo');

  // Settings & Music Jukebox State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [currentTrackId, setCurrentTrackId] = useState<string>(sound.currentTrackId);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(sound.isBgmPlaying);

  // Subscribe to music state changes
  useEffect(() => {
    const unsub = sound.subscribeBgm((tId, playing) => {
      setCurrentTrackId(tId);
      setIsBgmPlaying(playing);
    });
    return () => unsub();
  }, []);

  const [activeSticker, setActiveSticker] = useState<{
    id: string;
    character: Character;
    slogan: string;
    soundType: string;
  } | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [isTurnBusy, setIsTurnBusy] = useState<boolean>(false);
  const [isDiceRolling, setIsDiceRolling] = useState<boolean>(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [rankCounter, setRankCounter] = useState<number>(1);
  const [isTimeStopped, setIsTimeStopped] = useState<boolean>(false);
  const [activeBanner, setActiveBanner] = useState<ActionBannerData | null>(null);
  const [activeVoiceCallout, setActiveVoiceCallout] = useState<{
    line: CharacterVoiceLine;
    character: Character;
  } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [selectedCellInfo, setSelectedCellInfo] = useState<number | null>(null);
  const [activeStandVFX, setActiveStandVFX] = useState<StandVFXData | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Gameplay State & AI Difficulty
  const [currentStance, setCurrentStance] = useState<StanceType>('rush');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('normal');
  const [clashData, setClashData] = useState<StandClashData | null>(null);
  const [dangerAhead, setDangerAhead] = useState<DangerAheadInfo | null>(null);

  const screenRef = useRef(screen);
  screenRef.current = screen;
  const aiDifficultyRef = useRef<AiDifficulty>(aiDifficulty);
  aiDifficultyRef.current = aiDifficulty;

  const playersRef = useRef<Player[]>([]);
  playersRef.current = players;
  const currentIdxRef = useRef<number>(currentPlayerIndex);
  currentIdxRef.current = currentPlayerIndex;
  const isTurnBusyRef = useRef<boolean>(false);
  isTurnBusyRef.current = isTurnBusy;

  // Synchronously update both React state and playersRef.current to prevent race conditions
  const setPlayersWithRef = useCallback((updater: (prev: Player[]) => Player[]) => {
    setPlayers((prev) => {
      const next = updater(prev);
      playersRef.current = next;
      return next;
    });
  }, []);

  const handleCellLandingRef = useRef<(playerId: number, cellNumber: number, isSpecialMove: boolean) => Promise<void>>(async () => {});

  // Fully purge all visual dialogue, stickers, banners, and battle effects when exiting to menu
  const handleReturnToMenu = useCallback(() => {
    if (gameMode === 'online') {
      onlineService.leaveRoom();
      setOnlineRoomCode(null);
      setMyOnlinePlayerId(null);
    }
    sound.stopSpecialTileAudio(true);
    sound.stopAmbience();
    characterVoiceAudio.stopAllVoiceAudio();
    setActiveBanner(null);
    setActiveSticker(null);
    setActiveVoiceCallout(null);
    setActiveStandVFX(null);
    setClashData(null);
    setSelectedCellInfo(null);
    setIsTurnBusy(false);
    setIsDiceRolling(false);
    setScreen('menu');
  }, [gameMode]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 45)]);
  }, []);

  // Sync real-time online multiplayer socket events
  useEffect(() => {
    const unsubRoomUpdate = onlineService.on('room_updated', (room: OnlineRoomState) => {
      setOnlineRoomCode(room.code);
      if (onlineService.myPlayerId) {
        setMyOnlinePlayerId(onlineService.myPlayerId);
      }
    });

    const unsubGameStarted = onlineService.on('game_started', (room: OnlineRoomState) => {
      handleStartOnlineGame(room);
    });

    const unsubDiceRolled = onlineService.on('dice_rolled', (data: { playerId: number; value: number }) => {
      const p = playersRef.current.find((item) => item.id === data.playerId);
      if (p) {
        executeRoll(data.value);
      }
    });

    const unsubClashSync = onlineService.on('clash_sync', (data: any) => {
      setClashData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          attackerScore: data.attackerScore ?? prev.attackerScore,
          defenderScore: data.defenderScore ?? prev.defenderScore,
          timeLeft: data.timeLeft ?? prev.timeLeft,
        };
      });
    });

    const unsubClashResolved = onlineService.on('clash_resolved', (data: { winnerId: number; loserId: number }) => {
      handleResolveClash(data.winnerId, data.loserId);
    });

    const unsubTaunt = onlineService.on('player_taunt', (data: { playerId: number; playerName: string; text: string }) => {
      addLog(`[TAUNT] ${data.playerName}: "${data.text}"`, 'stand');
      sound.playStandCry();
    });

    return () => {
      unsubRoomUpdate();
      unsubGameStarted();
      unsubDiceRolled();
      unsubClashSync();
      unsubClashResolved();
      unsubTaunt();
    };
  }, [addLog]);

  const triggerVoiceDialogue = useCallback(
    (char: Character, trigger: DialogueTrigger) => {
      const line = characterVoiceAudio.triggerVoiceLine(char.id, trigger);
      setActiveVoiceCallout({
        line,
        character: char,
      });
      addLog(
        `[${char.name}] "${line.dialogue}" (${line.japaneseRomaji})`,
        trigger === 'clash_win' ? 'clash' : trigger === 'special_cell' ? 'stand' : 'buff'
      );
    },
    [addLog]
  );

  const showBanner = useCallback((data: ActionBannerData, duration: number = 2200) => {
    setActiveBanner(data);
    setTimeout(() => {
      setActiveBanner(null);
    }, duration);
  }, []);

  // Danger Ahead Detection: Evaluates if active player is within 6 tiles of hazard
  const checkDangerAhead = useCallback((playerPos: number) => {
    const maxGoal = 100;
    for (let i = playerPos + 1; i <= Math.min(maxGoal, playerPos + 6); i++) {
      const special = SPECIAL_CELLS[i];
      if (special?.isHazard) {
        sound.playDangerWarning();
        return {
          cellNumber: i,
          distance: i - playerPos,
          name: special.name,
          standName: special.standName,
          effect: special.effectLabel,
        };
      }
    }
    return null;
  }, []);

  // Update location-aware soundscape and danger ahead cue whenever active player position changes
  useEffect(() => {
    if (screen !== 'playing' || players.length === 0) {
      setDangerAhead(null);
      return;
    }
    const curP = players[currentPlayerIndex];
    if (curP && curP.finishedRank === null) {
      setDangerAhead(checkDangerAhead(curP.pos));

      // Trigger location-aware procedural ambient soundscape!
      const targetZone = sound.updateLocationAmbience(curP.pos);
      if (targetZone !== currentZone) {
        setCurrentZone(targetZone);
        addLog(
          `Entered ${LOCATION_ZONES[targetZone].name} (${LOCATION_ZONES[targetZone].range}) — ${LOCATION_ZONES[targetZone].description}`,
          'info'
        );
      }
    } else {
      setDangerAhead(null);
    }
  }, [currentPlayerIndex, players, screen, checkDangerAhead, currentZone, addLog]);

  // Turn advance logic
  const advanceTurn = useCallback(
    (nextIdx: number) => {
      const curList = playersRef.current;
      let candidate = nextIdx;
      let looped = 0;
      const total = curList.length;

      while (curList[candidate].finishedRank !== null && looped < total) {
        candidate = (candidate + 1) % total;
        looped++;
      }

      const nextPlayer = curList[candidate];

      // Handle skipping frozen turn
      if (nextPlayer.missTurns > 0) {
        addLog(`${nextPlayer.name} is recovering and passes their turn. (${nextPlayer.missTurns} left)`, 'hazard');
        sound.playHazard();

        setPlayersWithRef((prev) =>
          prev.map((p, idx) =>
            idx === candidate
              ? {
                  ...p,
                  missTurns: p.missTurns - 1,
                  sp: Math.min(p.maxSp, p.sp + 15),
                  hp: Math.min(p.maxHp, p.hp + 10),
                }
              : p
          )
        );

        setTimeout(() => {
          advanceTurn((candidate + 1) % total);
        }, 1000);
        return;
      }

      // Decrement cooldowns and recover energy (balanced AI energy gain)
      setPlayersWithRef((prev) =>
        prev.map((p, idx) => {
          if (idx === candidate) {
            const updatedCooldowns: Record<string, number> = {};
            Object.entries(p.abilityCooldowns).forEach(([k, v]) => {
              if (v > 1) updatedCooldowns[k] = v - 1;
            });
            return {
              ...p,
              abilityCooldowns: updatedCooldowns,
              sp: Math.min(p.maxSp, p.sp + (p.isAi ? 8 : 12)),
              buffs: {
                ...p.buffs,
                shieldTurns: Math.max(0, p.buffs.shieldTurns - 1),
              },
            };
          }
          return p;
        })
      );

      setCurrentPlayerIndex(candidate);
      setIsTurnBusy(false);
    },
    [addLog, setPlayersWithRef]
  );

  // Check if landing triggers a Stand Clash with another player (only on exact same tile!)
  const checkForStandClash = (activeP: Player, landingPos: number): Player | null => {
    const rivals = playersRef.current.filter(
      (r) => r.id !== activeP.id && r.finishedRank === null && r.pos === landingPos
    );
    return rivals.length > 0 ? rivals[0] : null;
  };

  // Resolve Stand Clash
  const handleResolveClash = (winnerId: number, loserId: number) => {
    if (gameMode === 'online') {
      onlineService.resolveClash(winnerId, loserId);
    }
    setClashData(null);
    const winPlayer = playersRef.current.find((p) => p.id === winnerId);
    const losePlayer = playersRef.current.find((p) => p.id === loserId);

    if (winPlayer && losePlayer) {
      addLog(`STAND CLASH VICTORY! ${winPlayer.name} overpowered ${losePlayer.name}!`, 'clash');
      triggerVoiceDialogue(winPlayer.character, 'clash_win');
      showBanner({
        title: 'CLASH VICTORY',
        subtitle: `${winPlayer.name} knocked back ${losePlayer.name} 3 tiles!`,
        cry: winPlayer.character.standCry,
        characterName: winPlayer.name,
        colorHex: winPlayer.character.hexColor,
        type: 'clash',
      });

      // Knock loser back 3 tiles, grant winner +25 SP
      setPlayersWithRef((prev) =>
        prev.map((p) => {
          if (p.id === winnerId) {
            return {
              ...p,
              sp: Math.min(p.maxSp, p.sp + 25),
              clashWins: p.clashWins + 1,
            };
          }
          if (p.id === loserId) {
            return {
              ...p,
              pos: Math.max(1, p.pos - 3),
              hp: Math.max(10, p.hp - 20),
            };
          }
          return p;
        })
      );
    }
  };

  // Check victory / reaching goal (Tile 100)
  const checkVictoryCondition = useCallback(
    (playerId: number, finalPos?: number) => {
      const curList = playersRef.current;
      const p = curList.find((item) => item.id === playerId);
      if (!p) return;

      const currentPos = finalPos !== undefined ? finalPos : p.pos;
      const goalCell = 100;
      let updatedRankCounter = rankCounter;
      let newFinishedRank = p.finishedRank;

      if (currentPos === goalCell && newFinishedRank === null) {
        newFinishedRank = updatedRankCounter;
        updatedRankCounter++;
        setRankCounter(updatedRankCounter);

        // Play Tile 100 victory song continuously until new game or menu
        sound.playSpecialTileAudio(100);
        confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 } });
        triggerVoiceDialogue(p.character, 'clash_win');

        addLog(`*** ${p.name} REACHED TILE 100! (Rank #${newFinishedRank}) ***`, 'win');
        showBanner(
          {
            title: 'MADE IT TO HEAVEN!',
            subtitle: `${p.name} reached ultimate Stand Ascension at Tile 100!`,
            cry: 'MADE IN HEAVEN!',
            characterName: p.name,
            colorHex: p.character.hexColor,
            type: 'win',
          },
          3000
        );
      }

      const updatedList = curList.map((item) =>
        item.id === playerId ? { ...item, pos: currentPos, finishedRank: newFinishedRank } : item
      );
      setPlayersWithRef(() => updatedList);

      const activeRemaining = updatedList.filter((item) => item.finishedRank === null);
      if (activeRemaining.length <= 1) {
        if (activeRemaining.length === 1) {
          activeRemaining[0].finishedRank = updatedRankCounter;
        }
        const sorted = [...updatedList].sort((a, b) => (a.finishedRank || 99) - (b.finishedRank || 99));
        setWinner(sorted[0]);
        setTimeout(() => setScreen('victory'), 2200);
        return;
      }

      if (p.extraRolls > 0 && newFinishedRank === null) {
        addLog(`${p.name} has an extra roll ready!`, 'stand');
        setPlayersWithRef((inner) =>
          inner.map((item) =>
            item.id === playerId ? { ...item, extraRolls: item.extraRolls - 1 } : item
          )
        );
        setIsTurnBusy(false);
      } else {
        setTimeout(() => {
          advanceTurn((currentIdxRef.current + 1) % updatedList.length);
        }, 700);
      }
    },
    [addLog, advanceTurn, rankCounter, setPlayersWithRef, showBanner, triggerVoiceDialogue]
  );

  // Step-by-step movement animation
  const animatePlayerMovement = useCallback(
    (playerId: number, targetPos: number, isSpecialMove: boolean = false): Promise<void> => {
      return new Promise<void>((resolve) => {
        const curList = playersRef.current;
        const currentP = curList.find((p) => p.id === playerId);
        if (!currentP) {
          resolve();
          return;
        }

        const start = currentP.pos;
        let end = targetPos;

        // Goal is always Tile 100
        const goal = 100;
        if (end > goal) {
          const overshoot = end - goal;
          end = Math.max(1, goal - overshoot);
          addLog(`${currentP.name} overshot Tile ${goal}! Bounced back to ${end}.`, 'hazard');
        }
        if (end < 1) end = 1;

        const steps = Math.abs(end - start);
        if (steps === 0) {
          setTimeout(async () => {
            if (handleCellLandingRef.current) {
              await handleCellLandingRef.current(playerId, end, isSpecialMove);
            }
            resolve();
          }, 250);
          return;
        }

        // Trigger iconic JoJo Move SFX & Character Anime Sticker on move
        sound.playJoJoMoveSound(currentP.character.id);
        const sloganCandidates = [
          currentP.character.standCry,
          'STAND POWER!',
          'MENACING!',
          'STAND PROUD!',
          'MOVE!',
        ];
        const slogan = currentP.character.standCry || sloganCandidates[Math.floor(Math.random() * sloganCandidates.length)];
        setActiveSticker({
          id: Math.random().toString(36),
          character: currentP.character,
          slogan,
          soundType: 'jojo-move',
        });

        const stepDir = end > start ? 1 : -1;
        let curStep = 0;

        // For special moves (warps, slides, shortcuts), hop faster so long distances look snappy & dynamic
        const hopSpeed = isSpecialMove ? Math.max(25, Math.min(75, Math.floor(1000 / steps))) : 120;

        const hopInterval = setInterval(() => {
          curStep++;
          const intermediate = start + curStep * stepDir;
          sound.playStepHop();

          setPlayersWithRef((inner) =>
            inner.map((p) => (p.id === playerId ? { ...p, pos: intermediate } : p))
          );

          if (curStep >= steps) {
            clearInterval(hopInterval);

            // Ensure exact final position is set in both state and ref
            setPlayersWithRef((inner) =>
              inner.map((p) => (p.id === playerId ? { ...p, pos: end } : p))
            );

            // Check if passed near a rival to trigger Stand Clash!
            const rivalForClash = checkForStandClash(currentP, end);
            if (rivalForClash && !isSpecialMove) {
              sound.playStandCry();
              setClashData({
                attacker: currentP,
                defender: rivalForClash,
                attackerScore: 50,
                defenderScore: 50,
                timeLeft: 4.0,
                winnerId: null,
                difficulty: aiDifficultyRef.current,
              });
            }

            setTimeout(async () => {
              if (handleCellLandingRef.current) {
                await handleCellLandingRef.current(playerId, end, isSpecialMove);
              }
              resolve();
            }, 300);
          }
        }, hopSpeed);
      });
    },
    [addLog, checkForStandClash, setPlayersWithRef]
  );

  // Cell landing effect resolution
  const handleCellLanding = useCallback(
    async (playerId: number, cellNumber: number, isSpecialMove: boolean): Promise<void> => {
      const special = SPECIAL_CELLS[cellNumber];
      const currentP = playersRef.current.find((p) => p.id === playerId);
      if (!currentP) return;

      const maxGoal = 100;

      // 1. If arriving from a warp/slide or if there is no special cell on this tile
      if (isSpecialMove || !special) {
        checkVictoryCondition(playerId, cellNumber);
        return;
      }

      // 2. Hamon Shield protection for hazards
      if (special.isHazard && currentP.buffs.shieldTurns > 0) {
        addLog(`${currentP.name}'s Stand Barrier neutralized [${special.name}]!`, 'buff');
        sound.playStandSummon();
        showBanner({
          title: 'BARRIER PROTECT',
          subtitle: `Hamon Barrier neutralized [${special.name}]!`,
          cry: 'STAND BARRIER!',
          characterName: currentP.name,
          colorHex: currentP.character.hexColor,
          type: 'buff',
        });
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, buffs: { ...p.buffs, shieldTurns: Math.max(0, p.buffs.shieldTurns - 1) } }
              : p
          )
        );
        checkVictoryCondition(playerId, cellNumber);
        return;
      }

      // 3. Trigger special cell dialogue, sounds, and action banner
      addLog(
        `${currentP.name} landed on Cell ${cellNumber} [${special.name}]: ${special.effectLabel}`,
        special.isHazard ? 'hazard' : 'stand'
      );
      triggerVoiceDialogue(currentP.character, 'special_cell');

      showBanner(
        {
          title: special.name,
          subtitle: special.effectLabel,
          cry: special.cry,
          characterName: currentP.name,
          colorHex: special.colorHex,
          type: special.isHazard ? 'hazard' : 'warp',
        },
        2500
      );

      // Play special tile theme song! Cuts any previous tile song and plays with same strength volume
      sound.playSpecialTileAudio(cellNumber);

      if (special.isHazard) {
        // Deal hazard damage
        setPlayersWithRef((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, hp: Math.max(15, p.hp - 20) } : p))
        );
      }

      // 4. Apply non-movement stat effects
      if (cellNumber === 5) {
        // Speedwagon: +35 HP & +20 SP
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, hp: Math.min(p.maxHp, p.hp + 35), sp: Math.min(p.maxSp, p.sp + 20) }
              : p
          )
        );
      } else if (cellNumber === 15) {
        // The World: freeze for 2 turns
        sound.playTimeStop();
        setPlayersWithRef((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, missTurns: p.missTurns + 2 } : p))
        );
      } else if (cellNumber === 18) {
        // Zeppeli Ripple: +30 SP, 2-turn Hamon Shield, +1 extra roll
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  sp: Math.min(p.maxSp, p.sp + 30),
                  buffs: { ...p.buffs, shieldTurns: p.buffs.shieldTurns + 2 },
                  extraRolls: p.extraRolls + 1,
                }
              : p
          )
        );
      } else if (cellNumber === 24) {
        // Silver Chariot: knock back nearest rival ahead by 3 tiles
        const rivalsAhead = playersRef.current
          .filter((r) => r.id !== playerId && r.pos > currentP.pos && r.finishedRank === null)
          .sort((a, b) => a.pos - b.pos);
        if (rivalsAhead.length > 0) {
          const target = rivalsAhead[0];
          const knockedPos = Math.max(1, target.pos - 3);
          addLog(`SILVER CHARIOT! ${target.name} knocked back to Cell ${knockedPos}!`, 'attack');
          setPlayersWithRef((prev) =>
            prev.map((p) => (p.id === target.id ? { ...p, pos: knockedPos } : p))
          );
        }
      } else if (cellNumber === 28) {
        // Star Platinum: +2 extra rolls & +25 SP
        sound.playPunchBarrage();
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, extraRolls: p.extraRolls + 2, sp: Math.min(p.maxSp, p.sp + 25) }
              : p
          )
        );
      } else if (cellNumber === 32) {
        // Magician's Red: Burn 25 HP to rival ahead
        sound.playPunchBarrage();
        const rivalsAhead = playersRef.current
          .filter((r) => r.id !== playerId && r.pos > currentP.pos && r.finishedRank === null)
          .sort((a, b) => a.pos - b.pos);
        if (rivalsAhead.length > 0) {
          const target = rivalsAhead[0];
          addLog(`CROSSFIRE HURRICANE! ${target.name} suffered 25 Burn Damage!`, 'attack');
          setPlayersWithRef((prev) =>
            prev.map((p) => (p.id === target.id ? { ...p, hp: Math.max(10, p.hp - 25) } : p))
          );
        }
      } else if (cellNumber === 38) {
        // Hierophant Green: +20 SP & +1 roll
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, sp: Math.min(p.maxSp, p.sp + 20), extraRolls: p.extraRolls + 1 }
              : p
          )
        );
      } else if (cellNumber === 42) {
        // Echoes Act 3: +1 roll, +15 SP
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, sp: Math.min(p.maxSp, p.sp + 15), extraRolls: p.extraRolls + 1 }
              : p
          )
        );
      } else if (cellNumber === 45) {
        // Bruford Hair: miss 1 turn & -15 SP
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, missTurns: p.missTurns + 1, sp: Math.max(0, p.sp - 15) }
              : p
          )
        );
      } else if (cellNumber === 60) {
        // Heaven's Door: +1 roll to player, next rival misses turn
        setPlayersWithRef((prev) => {
          const nextIdx = (currentIdxRef.current + 1) % prev.length;
          return prev.map((p, idx) => {
            if (p.id === playerId) return { ...p, extraRolls: p.extraRolls + 1 };
            if (idx === nextIdx) return { ...p, missTurns: p.missTurns + 1 };
            return p;
          });
        });
      } else if (cellNumber === 64) {
        // Purple Haze: -20 HP, +35 SP
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, hp: Math.max(10, p.hp - 20), sp: Math.min(p.maxSp, p.sp + 35) }
              : p
          )
        );
      } else if (cellNumber === 70) {
        // Hail 2 You: grant next player +1 roll
        setPlayersWithRef((prev) => {
          const nextIdx = (currentIdxRef.current + 1) % prev.length;
          return prev.map((p, idx) => {
            if (idx === nextIdx) return { ...p, extraRolls: p.extraRolls + 1 };
            return p;
          });
        });
        const nextRival = playersRef.current[(currentIdxRef.current + 1) % playersRef.current.length];
        if (nextRival) {
          addLog(`HAIL 2 U! ${currentP.name}'s wish granted ${nextRival.name} +1 free roll!`, 'stand');
        }
      } else if (cellNumber === 80) {
        // The Fool: miss 1 turn
        setPlayersWithRef((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, missTurns: p.missTurns + 1 } : p))
        );
      } else if (cellNumber === 85) {
        // Whitesnake: cooldowns +1
        setPlayersWithRef((prev) =>
          prev.map((p) => {
            if (p.id !== playerId) return p;
            const updatedCd: Record<string, number> = {};
            Object.entries(p.abilityCooldowns).forEach(([k, v]) => {
              updatedCd[k] = v + 1;
            });
            return { ...p, abilityCooldowns: updatedCd };
          })
        );
      } else if (cellNumber === 88) {
        // D4C: cleanse debuffs & shield
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId
              ? { ...p, missTurns: 0, buffs: { ...p.buffs, shieldTurns: 2 } }
              : p
          )
        );
      } else if (cellNumber === 90) {
        // Stone Mask: +40 SP
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId ? { ...p, sp: Math.min(p.maxSp, p.sp + 40) } : p
          )
        );
      } else if (cellNumber === 98) {
        // Made in Heaven: +2 rolls
        setPlayersWithRef((prev) =>
          prev.map((p) =>
            p.id === playerId ? { ...p, extraRolls: p.extraRolls + 2 } : p
          )
        );
      }

      // 5. Determine movement destination if this special cell has targetCell or moveOffset
      let destination: number | null = null;
      if (special.targetCell !== undefined) {
        destination = Math.min(maxGoal, Math.max(1, special.targetCell));
      } else if (special.moveOffset !== undefined && special.moveOffset !== 0) {
        destination = Math.min(maxGoal, Math.max(1, cellNumber + special.moveOffset));
      }

      // Pause briefly (1000ms) so the player can see the action banner and hear the cry/sfx!
      await new Promise((r) => setTimeout(r, 1000));

      // If destination exists, animate player to destination!
      if (destination !== null && destination !== cellNumber) {
        if (special.isHazard) {
          sound.playHazard();
          addLog(`HAZARD! ${currentP.name} was forced to Cell ${destination}!`, 'hazard');
        } else {
          sound.playWarp();
          addLog(`WARP! ${currentP.name} vaulted forward to Cell ${destination}!`, 'stand');
        }
        await animatePlayerMovement(playerId, destination, true);
      } else {
        // No movement warp/slide, check victory condition directly on this cell
        checkVictoryCondition(playerId, cellNumber);
      }
    },
    [addLog, animatePlayerMovement, checkVictoryCondition, setPlayersWithRef, showBanner, triggerVoiceDialogue]
  );

  handleCellLandingRef.current = handleCellLanding;

  // Master Dice Execution with Stance mechanics (ORA Rush, Precision, Hamon Guard)
  const executeRoll = async (val: number) => {
    if (isTurnBusyRef.current || screen !== 'playing') return;
    const activePlayer = playersRef.current[currentIdxRef.current];
    if (!activePlayer || activePlayer.finishedRank !== null) return;

    setIsTurnBusy(true);
    setIsDiceRolling(true);
    sound.playDiceRoll();

    // 1. Die spins for 750ms then STOPS cleanly
    await new Promise((r) => setTimeout(r, 750));
    setIsDiceRolling(false);
    setDiceValue(val);

    if (val === 1) {
      sound.playStandCry();
      addLog(`[CRITICAL STAND ACE] ${activePlayer.name}'s signature Stand Emblem was rolled! "${activePlayer.character.standCry}"`, 'stand');
    }

    // Authentic movement distance matches the rolled dice value!
    const moveDistance = val;
    addLog(`${activePlayer.name} rolled a ${val}! Moving forward ${val} ${val === 1 ? 'tile' : 'tiles'}.`, 'info');

    await new Promise((r) => setTimeout(r, 450));
    if (screenRef.current !== 'playing') return;
    await animatePlayerMovement(activePlayer.id, activePlayer.pos + moveDistance);
  };

  const handleRollDice = () => {
    if (gameMode === 'online') {
      const activeP = playersRef.current[currentIdxRef.current];
      if (!activeP || activeP.id !== myOnlinePlayerId) {
        addLog("Not your turn! Waiting for online rival to roll...", "hazard");
        return;
      }
      onlineService.rollDice();
      return;
    }
    const rolled = Math.floor(Math.random() * 6) + 1;
    executeRoll(rolled);
  };

  // Stand Ability Card activation
  const handleUseAbility = (ability: StandAbility) => {
    const p = playersRef.current[currentIdxRef.current];
    if (!p || p.sp < ability.spCost || isTurnBusyRef.current) return;

    if (gameMode === 'online') {
      onlineService.useAbility(ability);
    }

    sound.playStandCry();

    // Trigger high-impact Stand Ability Activation VFX & Particle Explosion
    setActiveStandVFX({
      id: `${Date.now()}-${ability.id}`,
      ability,
      player: p,
    });
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 700);

    setPlayersWithRef((prev) =>
      prev.map((item, idx) =>
        idx === currentIdxRef.current
          ? {
              ...item,
              sp: item.sp - ability.spCost,
              abilityCooldowns: {
                ...item.abilityCooldowns,
                [ability.id]: ability.cooldownTurns,
              },
            }
          : item
      )
    );

    addLog(`${p.name} activated [${ability.name}]!`, 'stand');
    triggerVoiceDialogue(p.character, 'turn_start');
    showBanner({
      title: ability.name,
      subtitle: ability.description,
      cry: ability.voiceLine,
      characterName: p.name,
      colorHex: p.character.hexColor,
      type: 'attack',
    });

    setTimeout(() => {
      switch (ability.id) {
        case 'jotaro_time_stop':
          setIsTimeStopped(true);
          sound.playTimeStop();
          setTimeout(() => {
            setIsTimeStopped(false);
            sound.playTimeResume();
          }, 2400);
          animatePlayerMovement(p.id, p.pos + 4, true);
          break;

        case 'jotaro_star_finger':
        case 'johnny_nail_bullet':
        case 'jonathan_zoom_punch':
        case 'jolyne_throw': {
          sound.playPunchBarrage();
          const rivalsAhead = playersRef.current
            .filter((rival) => rival.id !== p.id && rival.pos > p.pos && rival.finishedRank === null)
            .sort((a, b) => a.pos - b.pos);
          if (rivalsAhead.length > 0) {
            const target = rivalsAhead[0];
            const newPos = Math.max(1, target.pos - 4);
            addLog(`${p.name} struck ${target.name}, pushing them back to Cell ${newPos}!`, 'attack');
            setPlayersWithRef((prev) =>
              prev.map((item) => (item.id === target.id ? { ...item, pos: newPos } : item))
            );
          }
          break;
        }

        case 'jotaro_ora_rush':
          sound.playPunchBarrage();
          setPlayersWithRef((prev) =>
            prev.map((item, idx) =>
              idx === currentIdxRef.current ? { ...item, extraRolls: item.extraRolls + 1 } : item
            )
          );
          break;

        case 'giorno_life_spring':
        case 'joseph_nigerundayo':
          sound.playWarp();
          animatePlayerMovement(p.id, p.pos + 4, true);
          break;

        case 'giorno_reflect':
        case 'jolyne_mobius':
          setPlayersWithRef((prev) =>
            prev.map((item, idx) =>
              idx === currentIdxRef.current
                ? { ...item, buffs: { ...item.buffs, shieldTurns: 2 } }
                : item
            )
          );
          break;

        case 'josuke_repair':
          sound.playStandSummon();
          setPlayersWithRef((prev) =>
            prev.map((item, idx) =>
              idx === currentIdxRef.current
                ? { ...item, missTurns: 0, hp: Math.min(item.maxHp, item.hp + 40), pos: Math.min(100, item.pos + 2) }
                : item
            )
          );
          break;

        case 'dio_za_warudo':
          setIsTimeStopped(true);
          sound.playTimeStop();
          setTimeout(() => {
            setIsTimeStopped(false);
            sound.playTimeResume();
          }, 3000);
          setPlayersWithRef((prev) =>
            prev.map((item, idx) =>
              idx === currentIdxRef.current ? { ...item, extraRolls: item.extraRolls + 2 } : item
            )
          );
          break;

        default:
          animatePlayerMovement(p.id, p.pos + 3, true);
          break;
      }
    }, 1400);
  };

  // ROCK-SOLID AI ROLLING HANDLER: Guaranteed to roll every turn without hanging!
  useEffect(() => {
    if (screen !== 'playing') return;

    const curList = players;
    const activeP = curList[currentPlayerIndex];

    // Only run if active player is AI, not finished, and turn is not locked
    if (!activeP || !activeP.isAi || activeP.finishedRank !== null || isTurnBusy) {
      return;
    }

    const aiTimer = setTimeout(() => {
      // Re-verify turn validity and ensure screen is still actively playing
      if (screenRef.current !== 'playing' || isTurnBusyRef.current) return;

      const diff = aiDifficultyRef.current;
      const abilityThreshold = diff === 'easy' ? 0.20 : diff === 'hard' ? 0.45 : 0.30;
      const minSpThreshold = diff === 'easy' ? 60 : 35;

      // AI chooses whether to activate an ability
      const usableAbilities = activeP.character.abilities.filter((ab) => {
        const cd = activeP.abilityCooldowns[ab.id] || 0;
        return activeP.sp >= ab.spCost && cd === 0 && activeP.sp >= minSpThreshold;
      });

      if (usableAbilities.length > 0 && Math.random() < abilityThreshold) {
        const chosen = usableAbilities[Math.floor(Math.random() * usableAbilities.length)];
        handleUseAbility(chosen);
        setTimeout(() => {
          if (screenRef.current === 'playing') {
            handleRollDice();
          }
        }, 1800);
      } else {
        // Direct dice roll
        handleRollDice();
      }
    }, 1100);

    return () => clearTimeout(aiTimer);
  }, [currentPlayerIndex, isTurnBusy, screen]);

  // Start Standard Game with configuration & AI difficulty
  const handleStartGame = (
    mode: GameMode,
    dMode: DiceMode,
    configs: Array<{ name: string; character: Character; isAi: boolean }>,
    difficulty: AiDifficulty = 'normal'
  ) => {
    setAiDifficulty(difficulty);
    aiDifficultyRef.current = difficulty;
    const initializedPlayers: Player[] = configs.map((cfg, idx) => ({
      id: idx + 1,
      name: cfg.name,
      character: cfg.character,
      pos: 1,
      prevPos: 1,
      hp: 100, // 100 Willpower
      maxHp: 100,
      sp: 50, // 50 Stand Power
      maxSp: 100,
      missTurns: 0,
      extraRolls: 0,
      isAi: cfg.isAi,
      finishedRank: null,
      buffs: {
        shieldTurns: 0,
        doubleRollNext: false,
        reflectTurns: 0,
        precisionChoice: false,
      },
      abilityCooldowns: {},
      clashWins: 0,
    }));

    setGameMode(mode);
    setDiceMode(dMode);
    setPlayers(initializedPlayers);
    playersRef.current = initializedPlayers;
    setCurrentPlayerIndex(0);
    setRankCounter(1);
    setDiceValue(null);
    setIsTurnBusy(false);
    setIsDiceRolling(false);
    setIsTimeStopped(false);
    setWinner(null);
    setLogs([]);
    setCurrentStance('rush');
    setClashData(null);
    setScreen('loading');

    // Stop any previously playing special tile or Tile 100 victory music
    sound.stopSpecialTileAudio(true);

    // Start battle music matching protagonist's theme if default is active
    const leadCharId = configs[0]?.character?.id;
    let trackToPlay = sound.currentTrackId;
    if (sound.currentTrackId === 'stardust_crusaders') {
      if (leadCharId === 'giorno') trackToPlay = 'il_vento_d_oro';
      else if (leadCharId === 'josuke' || leadCharId === 'kira') trackToPlay = 'diamond_is_unbreakable';
      else if (leadCharId === 'jolyne') trackToPlay = 'stone_ocean';
      else if (leadCharId === 'joseph') trackToPlay = 'awake';
    }
    sound.playTrack(trackToPlay);
  };

  // Start Online Multiplayer Game from Lobby
  const handleStartOnlineGame = (roomState: OnlineRoomState) => {
    setIsOnlineLobbyOpen(false);
    setOnlineRoomCode(roomState.code);

    const configs = roomState.players.map((p) => {
      const charObj = CHARACTERS.find((c) => c.id === p.characterId) || CHARACTERS[0];
      return {
        name: p.name,
        character: charObj,
        isAi: false,
      };
    });

    handleStartGame('online', 'auto', configs, 'normal');
  };

  const handleLoadingComplete = () => {
    setScreen('playing');
    addLog(`STAND CLASH ARENA COMMENCED!`, 'stand');
    sound.playStandSummon();
  };

  // Restart the current match (resetting positions & stats)
  const handleRestartMatch = () => {
    if (players.length > 0) {
      const configs = players.map((p) => ({
        name: p.name,
        character: p.character,
        isAi: p.isAi,
      }));
      handleStartGame(gameMode, diceMode, configs, aiDifficulty);
    } else {
      setScreen('character-select');
    }
  };

  const activePlayer = players[currentPlayerIndex];
  const activeBoardLength = 100;

  return (
    <main
      className={`w-screen h-screen relative bg-slate-950 overflow-hidden font-oswald text-white select-none ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* 3D / 2D Board */}
      {screen === 'playing' && (
        <div className="w-full h-full relative">
          {viewMode === '2d' ? (
            <Tactical2DBoard
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              boardLength={activeBoardLength}
              onTileClick={(cellNum) => setSelectedCellInfo(cellNum)}
            />
          ) : (
            <ThreeBoard
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              viewMode={viewMode}
              boardLength={activeBoardLength}
              diceRolling={isDiceRolling}
              diceValue={diceValue}
              isTimeStopped={isTimeStopped}
              onTileClick={(cellNum) => setSelectedCellInfo(cellNum)}
            />
          )}

          {/* Stand Ability Cards Dock — Anchored on bottom-left, opens upward */}
          {activePlayer && (
            <div className="fixed bottom-3 left-2 sm:bottom-4 sm:left-4 z-40 pointer-events-auto">
              <StandCardsDock
                player={activePlayer}
                isCurrentPlayerTurn={!activePlayer.isAi}
                isTurnBusy={isTurnBusy}
                onUseAbility={handleUseAbility}
              />
            </div>
          )}

          {/* Master Game HUD with prominent bottom-right Dice Controller and clean top-bar */}
          <GameHUD
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isTurnBusy={isTurnBusy}
            isDiceRolling={isDiceRolling}
            lastRoll={diceValue}
            diceMode={diceMode}
            viewMode={viewMode}
            soundEnabled={soundEnabled}
            logs={logs}
            dangerAhead={dangerAhead}
            currentStance={currentStance}
            currentZone={currentZone}
            aiDifficulty={aiDifficulty}
            gameMode={gameMode}
            onlineRoomCode={onlineRoomCode}
            myOnlinePlayerId={myOnlinePlayerId}
            onSelectStance={(st) => setCurrentStance(st)}
            onRollDice={handleRollDice}
            onToggleSound={() => {
              const muted = sound.toggleMute();
              setSoundEnabled(!muted);
            }}
            onSelectViewMode={(mode) => setViewMode(mode)}
            onPause={() => {
              sound.stopAmbience();
              setScreen('paused');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onExit={() => {
              setIsExitWarningOpen(true);
            }}
          />
        </div>
      )}

      {/* Stand Clash Rapid Mash Minigame Modal — Only active during gameplay */}
      {screen === 'playing' && (
        <StandClashModal
          clashData={clashData}
          onResolveClash={handleResolveClash}
          gameMode={gameMode}
          myOnlinePlayerId={myOnlinePlayerId}
          onOnlineClashTap={(side) => onlineService.clashTap(side)}
        />
      )}

      {/* Selected Cell Modal */}
      {screen === 'playing' && selectedCellInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-950 border-2 border-yellow-500 rounded-xl p-4 max-w-sm w-full shadow-2xl jojo-box-gold">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="font-bangers text-xl text-yellow-400">
                CELL {selectedCellInfo} INTEL
              </span>
              <button
                onClick={() => setSelectedCellInfo(null)}
                className="text-slate-400 hover:text-white text-base font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
            {SPECIAL_CELLS[selectedCellInfo] ? (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      SPECIAL_CELLS[selectedCellInfo].isHazard
                        ? 'bg-red-950 text-red-300 border border-red-600'
                        : 'bg-green-950 text-green-300 border border-green-600'
                    }`}
                  >
                    {SPECIAL_CELLS[selectedCellInfo].isHazard ? '⚠️ HAZARD TILE' : '⚡ SHORTCUT TILE'}
                  </span>
                  <span
                    className="font-bold text-sm truncate"
                    style={{ color: SPECIAL_CELLS[selectedCellInfo].colorHex }}
                  >
                    {SPECIAL_CELLS[selectedCellInfo].name}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {SPECIAL_CELLS[selectedCellInfo].description}
                </p>
                <div className="text-[11px] font-mono text-yellow-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Tactical Effect: {SPECIAL_CELLS[selectedCellInfo].effectLabel}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">
                Standard cobblestone tile in Morioh / Cairo. Safe terrain with no active Stand traps.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dramatic Comic Action Lettering Banner — Only during gameplay */}
      {screen === 'playing' && <ActionBanner banner={activeBanner} />}

      {/* Custom Anime Character Move Sticker Popup — Only during gameplay */}
      {screen === 'playing' && <MoveSticker sticker={activeSticker} />}

      {/* Pre-Game Stand Awakening Loading Screen */}
      {screen === 'loading' && (
        <LoadingScreen
          players={players}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* Menus, Selection, Rules, Pause, & Victory Overlays */}
      <MenuScreens
        screen={screen}
        winner={winner}
        finalPlayers={players}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const muted = sound.toggleMute();
          setSoundEnabled(!muted);
        }}
        onStartVsAi={() => {
          setGameMode('ai');
          setScreen('character-select');
        }}
        onStartPassAndPlay={() => {
          setGameMode('pass-and-play');
          setScreen('character-select');
        }}
        onOpenOnlineLobby={() => setIsOnlineLobbyOpen(true)}
        onOpenRules={() => setIsSettingsOpen(true)}
        onCloseRules={() => {
          setScreen(players.length > 0 ? 'playing' : 'menu');
        }}
        onResume={() => {
          const p = players[currentPlayerIndex];
          if (p) sound.updateLocationAmbience(p.pos);
          setScreen('playing');
        }}
        onRestartMatch={handleRestartMatch}
        onRequestExit={() => {
          setIsExitWarningOpen(true);
        }}
        onReturnToMenu={handleReturnToMenu}
        onConfirmStartGame={handleStartGame}
        onPlayAgain={handleRestartMatch}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Online Multiplayer Lobby Modal */}
      <OnlineLobbyModal
        isOpen={isOnlineLobbyOpen}
        onClose={() => setIsOnlineLobbyOpen(false)}
        onStartOnlineGame={handleStartOnlineGame}
      />

      {/* Abandon Match Confirmation Warning Modal */}
      <ExitWarningModal
        isOpen={isExitWarningOpen}
        onConfirmExit={() => {
          setIsExitWarningOpen(false);
          handleReturnToMenu();
          addLog('Match abandoned by player. Returned to title menu.', 'hazard');
        }}
        onCancel={() => setIsExitWarningOpen(false)}
        currentPlayerName={players[currentPlayerIndex]?.name}
      />

      {/* Unified Settings Modal (BGM Jukebox, Rules, Stands) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const muted = sound.toggleMute();
          setSoundEnabled(!muted);
        }}
        currentTrack={sound.getCurrentTrack()}
        isBgmPlaying={isBgmPlaying}
        onSelectTrack={(trackId) => sound.playTrack(trackId)}
        onToggleBgm={() => sound.toggleBgm()}
      />

      {/* Character Voice & Anime Dialogue Callout — Only during active gameplay */}
      {screen === 'playing' && activeVoiceCallout && (
        <CharacterVoiceCallout
          activeLine={activeVoiceCallout.line}
          characterName={activeVoiceCallout.character.name}
          characterBadge={activeVoiceCallout.character.badgeSymbol}
          characterHexColor={activeVoiceCallout.character.hexColor}
          onClose={() => setActiveVoiceCallout(null)}
        />
      )}

      {/* High-Impact Stand Ability Activation VFX — Only during active gameplay */}
      {screen === 'playing' && (
        <StandActivationVFX
          vfx={activeStandVFX}
          onComplete={() => setActiveStandVFX(null)}
        />
      )}
    </main>
  );
}
