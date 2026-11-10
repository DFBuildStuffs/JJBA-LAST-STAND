import React, { useState, useEffect } from 'react';
import { Character, CharacterId, OnlineRoomState, OnlinePlayerInfo } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { onlineService } from '../services/onlineMultiplayer';
import { sound } from '../services/audio';
import {
  Users,
  Globe,
  Sparkles,
  Copy,
  Check,
  Crown,
  Play,
  LogOut,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface OnlineLobbyModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onStartOnlineGame: (initialRoomState: OnlineRoomState, myPlayerId: number) => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen = true,
  onClose,
  onStartOnlineGame,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('jojo_player_name') || 'Jotaro';
  });
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('jotaro');
  const [joinCode, setJoinCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<OnlineRoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [activeTaunt, setActiveTaunt] = useState<string | null>(null);

  // Check URL query param for ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
      setTab('join');
    }
  }, []);

  // Subscribe to online service events
  useEffect(() => {
    onlineService.connect();

    const unsubCreated = onlineService.on('room_created', (data) => {
      setRoomState(data.room);
      setMyPlayerId(data.myPlayerId);
      onlineService.myPlayerId = data.myPlayerId;
      onlineService.myRoomCode = data.code;
      sound.playStandSummon();
    });

    const unsubJoined = onlineService.on('room_joined', (data) => {
      setRoomState(data.room);
      setMyPlayerId(data.myPlayerId);
      onlineService.myPlayerId = data.myPlayerId;
      onlineService.myRoomCode = data.code;
      sound.playStandSummon();
    });

    const unsubUpdate = onlineService.on('room_updated', (data) => {
      setRoomState(data.room);
    });

    const unsubPlayerJoined = onlineService.on('player_joined', (data) => {
      setRoomState(data.room);
      sound.playStandCry();
    });

    const unsubPlayerLeft = onlineService.on('player_left', (data) => {
      setRoomState(data.room);
    });

    const unsubStarted = onlineService.on('game_started', (data) => {
      sound.playStandCry();
      if (myPlayerId) {
        onStartOnlineGame(data.room, myPlayerId);
      }
    });

    const unsubError = onlineService.on('error', (data) => {
      setErrorMessage(data.message || 'Connection error.');
      sound.playHazard();
    });

    const unsubTaunt = onlineService.on('player_taunt', (data) => {
      setActiveTaunt(`${data.playerName}: "${data.message}"`);
      sound.playStandCry();
      setTimeout(() => setActiveTaunt(null), 2500);
    });

    return () => {
      unsubCreated();
      unsubJoined();
      unsubUpdate();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubStarted();
      unsubError();
      unsubTaunt();
    };
  }, [myPlayerId, onStartOnlineGame]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    localStorage.setItem('jojo_player_name', playerName.trim());
    setErrorMessage(null);
    onlineService.createRoom(playerName.trim(), selectedCharId);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !joinCode.trim()) return;
    localStorage.setItem('jojo_player_name', playerName.trim());
    setErrorMessage(null);
    onlineService.joinRoom(joinCode.trim().toUpperCase(), playerName.trim(), selectedCharId);
  };

  const handleCopyCode = () => {
    if (!roomState) return;
    navigator.clipboard.writeText(roomState.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSelectCharacter = (charId: CharacterId) => {
    setSelectedCharId(charId);
    if (roomState) {
      onlineService.selectCharacter(charId);
    }
  };

  const handleToggleReady = () => {
    sound.playDiceRoll();
    onlineService.toggleReady();
  };

  const handleStartGame = () => {
    sound.playVictory();
    onlineService.startGame();
  };

  const handleLeaveRoom = () => {
    onlineService.leaveRoom();
    setRoomState(null);
    setMyPlayerId(null);
  };

  const selectedCharObj = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const isHost = roomState?.hostSocketId && roomState.players.find((p) => p.id === myPlayerId)?.isHost;
  const myPlayer = roomState?.players.find((p) => p.id === myPlayerId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-oswald text-white select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border-3 border-yellow-400 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.4)] p-4 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Background Comic Lines */}
        <div className="absolute inset-0 comic-lines opacity-20 pointer-events-none" />

        {/* Floating Taunt Overlay */}
        {activeTaunt && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-purple-950 border-2 border-yellow-400 text-yellow-300 font-bangers text-base sm:text-lg px-4 py-1.5 rounded-full shadow-2xl animate-bounce">
            {activeTaunt}
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4 shrink-0 relative z-10">
          <div className="flex items-center gap-2.5">
            <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 animate-pulse" />
            <div>
              <h2 className="font-bangers text-2xl sm:text-3xl text-yellow-400 tracking-wider">
                ONLINE STAND BATTLE
              </h2>
              <p className="text-xs text-slate-400">Play real-time with friends across any device</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (roomState) handleLeaveRoom();
              onClose();
            }}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-3 px-3 py-2 bg-red-950/80 border border-red-500 rounded-xl text-red-300 text-xs flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Screen A: NOT IN A ROOM YET (Create or Join) */}
        {!roomState ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setTab('create')}
                className={`flex-1 py-2 text-sm font-bangers tracking-wider rounded-lg transition-all cursor-pointer ${
                  tab === 'create'
                    ? 'bg-yellow-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                HOST A ROOM
              </button>
              <button
                onClick={() => setTab('join')}
                className={`flex-1 py-2 text-sm font-bangers tracking-wider rounded-lg transition-all cursor-pointer ${
                  tab === 'join'
                    ? 'bg-purple-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                JOIN WITH CODE
              </button>
            </div>

            {/* Player Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Stand User Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={14}
                placeholder="Enter nickname..."
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-yellow-400 rounded-xl px-3.5 py-2 text-white font-bold text-sm outline-none transition-colors"
              />
            </div>

            {/* Character Selector Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Choose Your Fighter:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CHARACTERS.map((char) => {
                  const isSelected = selectedCharId === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => handleSelectCharacter(char.id)}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-yellow-400 bg-purple-950/80 scale-102 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white text-white mb-1"
                        style={{ backgroundColor: char.hexColor }}
                      >
                        {char.badgeSymbol}
                      </div>
                      <span className="font-bangers text-xs text-white truncate w-full">{char.name}</span>
                      <span className="text-[10px] text-yellow-400 font-mono truncate w-full">{char.stand}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Specific Content */}
            {tab === 'create' ? (
              <form onSubmit={handleCreateRoom} className="pt-2">
                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-bangers text-xl sm:text-2xl rounded-xl border-2 border-white shadow-2xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>GENERATE ROOM & INVITE FRIENDS</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinRoom} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Room Code:
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={10}
                    placeholder="e.g. STAND88"
                    className="w-full bg-slate-900 border-2 border-purple-500/80 focus:border-yellow-400 rounded-xl px-3.5 py-2.5 text-center text-yellow-300 font-mono font-black text-xl tracking-widest outline-none uppercase transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!playerName.trim() || !joinCode.trim()}
                  className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bangers text-xl sm:text-2xl rounded-xl border-2 border-white shadow-2xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>ENTER DUEL LOBBY</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Screen B: IN A LIVE ROOM LOBBY */
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {/* Room Code Banner */}
            <div className="bg-slate-900/90 border-2 border-yellow-400 rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                MATCH ROOM CODE
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-black text-yellow-400 tracking-widest my-1 flex items-center justify-center gap-2">
                <span>{roomState.code}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
                <button
                  onClick={handleShareLink}
                  className="flex items-center gap-1.5 px-3 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>SHARE LINK</span>
                </button>
              </div>
            </div>

            {/* Connected Duelists Slots (Up to 4 players) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Connected Duelists ({roomState.players.length}/4):
                </span>
                <span className="text-[11px] text-yellow-400 font-mono">
                  {roomState.players.length >= 2 ? 'Ready for Battle' : 'Waiting for more friends...'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roomState.players.map((p) => {
                  const char = CHARACTERS.find((c) => c.id === p.characterId) || CHARACTERS[0];
                  const isMe = p.id === myPlayerId;

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                        isMe
                          ? 'border-yellow-400 bg-purple-950/70 shadow-lg'
                          : 'border-slate-800 bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white text-white shrink-0"
                          style={{ backgroundColor: char.hexColor }}
                        >
                          {char.badgeSymbol}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bangers text-base text-white truncate max-w-[120px]">
                              {p.name} {isMe ? '(You)' : ''}
                            </span>
                            {p.isHost && (
                              <span title="Room Host">
                                <Crown className="w-4 h-4 text-yellow-400 fill-current shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-yellow-300 block leading-tight truncate">
                            {char.name} ({char.stand})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            p.isReady
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {p.isReady ? 'READY' : 'WAITING'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stand Character Switcher in Lobby */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Switch Fighter:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleSelectCharacter(char.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bangers flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      selectedCharId === char.id
                        ? 'border-yellow-400 bg-purple-900 text-yellow-300 scale-102'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{char.badgeSymbol}</span>
                    <span>{char.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Manga Taunts Bar */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400 font-bold shrink-0">Taunt:</span>
              <div className="flex gap-1 overflow-x-auto">
                {['ORA ORA!', 'MUDA MUDA!', 'WRYYYY!', 'YARE YARE DAZE', 'DOJYAAN~'].map((t) => (
                  <button
                    key={t}
                    onClick={() => onlineService.sendTaunt(t)}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bangers text-purple-300 hover:text-yellow-300 cursor-pointer shrink-0 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Ready & Host Start */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500 rounded-xl font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LEAVE</span>
              </button>

              <button
                onClick={handleToggleReady}
                className={`flex-1 py-2.5 font-bangers text-lg tracking-wider rounded-xl border-2 transition-all cursor-pointer active:scale-95 ${
                  myPlayer?.isReady
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-emerald-600 border-white text-white hover:bg-emerald-500 shadow-lg'
                }`}
              >
                {myPlayer?.isReady ? 'UNREADY' : 'READY UP!'}
              </button>

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={roomState.players.length < 2}
                  className={`flex-1 py-2.5 font-bangers text-lg tracking-wider rounded-xl border-2 border-white transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                    roomState.players.length >= 2
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-2xl hover:brightness-110'
                      : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START BATTLE ({roomState.players.length}/4)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
