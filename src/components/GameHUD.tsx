import React, { useState } from 'react';
import { Player, ViewMode, LogEntry, DiceMode, DangerAheadInfo, StanceType, AiDifficulty } from '../types/game';
import { SPECIAL_CELLS } from '../data/specialCells';
import {
  Eye,
  Pause,
  LogOut,
  Settings,
  Trophy,
  ScrollText,
  Dices,
  RefreshCw,
  AlertTriangle,
  Zap,
  Shield,
  Flame,
  Crosshair,
  Heart,
  Bot,
} from 'lucide-react';
import { SoundscapeZone, LOCATION_ZONES } from '../services/audio';
import { getCharacterDiceTheme } from '../services/diceTheming';

interface GameHUDProps {
  players: Player[];
  currentPlayerIndex: number;
  isTurnBusy: boolean;
  isDiceRolling: boolean;
  lastRoll: number | null;
  diceMode?: DiceMode;
  viewMode: ViewMode;
  soundEnabled: boolean;
  logs: LogEntry[];
  dangerAhead: DangerAheadInfo | null;
  currentStance?: StanceType;
  currentZone: SoundscapeZone;
  aiDifficulty?: AiDifficulty;
  onSelectStance?: (stance: StanceType) => void;
  onRollDice: () => void;
  onManualRoll?: (val: number) => void;
  onToggleSound: () => void;
  onSelectViewMode: (mode: ViewMode) => void;
  onPause: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  players,
  currentPlayerIndex,
  isTurnBusy,
  isDiceRolling,
  lastRoll,
  diceMode,
  viewMode,
  logs,
  dangerAhead,
  currentStance,
  currentZone,
  aiDifficulty = 'normal',
  onSelectStance,
  onRollDice,
  onManualRoll,
  onSelectViewMode,
  onPause,
  onOpenSettings,
  onExit,
}) => {
  const [intelTab, setIntelTab] = useState<'none' | 'standings' | 'logs'>('none');

  const activePlayer = players[currentPlayerIndex];
  const diceTheme = getCharacterDiceTheme(activePlayer?.character?.id);

  const getDiceDots = (val: number | null) => {
    if (!val) return diceTheme.badgeSymbol;
    if (val === 1) return diceTheme.badgeSymbol; // Signature character emblem on Ace
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[val - 1] || diceTheme.badgeSymbol;
  };

  const getLogBadge = (type?: string) => {
    switch (type) {
      case 'clash':
        return <span className="bg-orange-950 text-orange-300 border border-orange-500 px-1.5 py-0.2 rounded text-[9px] font-bold">CLASH</span>;
      case 'attack':
      case 'hazard':
        return <span className="bg-red-950 text-red-300 border border-red-600 px-1.5 py-0.2 rounded text-[9px] font-bold">HAZARD</span>;
      case 'stand':
        return <span className="bg-purple-950 text-purple-300 border border-purple-500 px-1.5 py-0.2 rounded text-[9px] font-bold">STAND</span>;
      case 'buff':
        return <span className="bg-sky-950 text-sky-300 border border-sky-500 px-1.5 py-0.2 rounded text-[9px] font-bold">BUFF</span>;
      case 'win':
        return <span className="bg-amber-950 text-amber-300 border border-amber-500 px-1.5 py-0.2 rounded text-[9px] font-bold">HEAVEN</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded text-[9px] font-bold">INFO</span>;
    }
  };

  return (
    <>
      {/* Sleek Top Navigation Bar */}
      <header className="fixed top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-30 flex items-center justify-between gap-1 sm:gap-2 pointer-events-none select-none pt-safe">
        {/* Active Player Status Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink min-w-0">
          {activePlayer && (
            <div className="bg-slate-950/95 border-2 border-yellow-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 sm:gap-3 backdrop-blur-md min-w-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold border-2 border-white text-white shadow shrink-0"
                style={{ backgroundColor: activePlayer.character.hexColor }}
              >
                {activePlayer.character.badgeSymbol}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 leading-none mb-0.5 sm:mb-1">
                  <span className="text-xs sm:text-sm font-bold text-white font-bangers tracking-wide truncate max-w-[70px] xs:max-w-[100px] sm:max-w-[150px]">
                    {activePlayer.name} {activePlayer.isAi ? '(AI)' : ''}
                  </span>
                  {activePlayer.isAi && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded uppercase border ${
                        aiDifficulty === 'easy'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : aiDifficulty === 'hard'
                          ? 'bg-red-950 text-red-300 border-red-600'
                          : 'bg-yellow-950 text-yellow-300 border-yellow-600'
                      }`}
                    >
                      {aiDifficulty}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-[11px] text-yellow-300 font-mono font-bold bg-slate-900 px-1 sm:px-1.5 py-0.2 rounded border border-slate-700 shrink-0">
                    T{activePlayer.pos}
                  </span>
                </div>

                {/* HP & SP Mini Gauges */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="flex items-center gap-0.5 sm:gap-1" title={`Willpower: ${activePlayer.hp}/${activePlayer.maxHp}`}>
                    <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 fill-current" />
                    <div className="w-8 xs:w-11 sm:w-14 md:w-16 h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${(activePlayer.hp / activePlayer.maxHp) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-red-400 font-bold">{activePlayer.hp}</span>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1" title={`Stand Power: ${activePlayer.sp}/${activePlayer.maxSp}`}>
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 fill-current" />
                    <div className="w-8 xs:w-11 sm:w-14 md:w-16 h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${(activePlayer.sp / activePlayer.maxSp) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono text-yellow-400 font-bold">{activePlayer.sp}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Controls: Camera View, Intel, Pause, Settings, Exit */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
          {/* View Mode Toggle */}
          <div className="bg-slate-950/95 border border-purple-500/80 rounded-xl p-0.5 sm:p-1 flex items-center gap-0.5 shadow-lg backdrop-blur-md">
            <button
              onClick={() => onSelectViewMode('3d-action')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === '3d-action'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3D Action Camera"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden md:inline">Action</span>
            </button>
            <button
              onClick={() => onSelectViewMode('3d-tactical')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === '3d-tactical'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="3D Top Arena View"
            >
              <span className="hidden md:inline">Arena</span>
              <span className="md:hidden">3D</span>
            </button>
            <button
              onClick={() => onSelectViewMode('2d')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="2D Tactical Board"
            >
              2D
            </button>
          </div>

          {/* Quick Intel toggles */}
          <div className="bg-slate-950/95 border border-purple-500/80 rounded-xl p-0.5 sm:p-1 flex items-center gap-0.5 sm:gap-1 shadow-lg backdrop-blur-md">
            <button
              onClick={() => setIntelTab(intelTab === 'standings' ? 'none' : 'standings')}
              className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                intelTab === 'standings' ? 'bg-yellow-500 text-slate-950' : 'text-slate-300 hover:text-yellow-400'
              }`}
              title="Standings"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => setIntelTab(intelTab === 'logs' ? 'none' : 'logs')}
              className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
                intelTab === 'logs' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-yellow-400'
              }`}
              title="Battle Log"
            >
              <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Pause, Settings, Exit buttons */}
          <div className="bg-slate-950/95 border border-yellow-500/80 rounded-xl p-0.5 sm:p-1 flex items-center gap-0.5 sm:gap-1 shadow-lg backdrop-blur-md">
            <button
              onClick={onPause}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-yellow-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Pause Match"
              aria-label="Pause"
            >
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-yellow-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Game Settings (BGM, Rules, Stands)"
              aria-label="Settings"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onExit}
              className="p-1 sm:p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Exit to Main Menu"
              aria-label="Exit"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DANGER AHEAD Alert Cue */}
      {dangerAhead && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none">
          <div className="bg-red-950/95 border-2 border-red-500 px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-red-200 backdrop-blur-md animate-bounce">
            <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
            <span className="font-bangers tracking-wider text-xs md:text-sm text-yellow-400 uppercase">
              DANGER:
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-none">
              {dangerAhead.name} — {dangerAhead.distance} tiles away!
            </span>
          </div>
        </div>
      )}

      {/* Drawer: Standings & Logs */}
      {intelTab !== 'none' && (
        <aside className="fixed top-16 right-3 w-80 max-w-[92vw] bg-slate-950/95 border-2 border-yellow-500 rounded-2xl p-3 shadow-2xl z-40 backdrop-blur-md animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex gap-1.5">
              <button
                onClick={() => setIntelTab('standings')}
                className={`text-xs font-bangers px-2.5 py-1 rounded-lg cursor-pointer ${
                  intelTab === 'standings' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                STANDINGS
              </button>
              <button
                onClick={() => setIntelTab('logs')}
                className={`text-xs font-bangers px-2.5 py-1 rounded-lg cursor-pointer ${
                  intelTab === 'logs' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                BATTLE LOG ({logs.length})
              </button>
            </div>

            <button
              onClick={() => setIntelTab('none')}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>

          {intelTab === 'standings' && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[...players]
                .sort((a, b) => {
                  if (a.finishedRank && !b.finishedRank) return -1;
                  if (!a.finishedRank && b.finishedRank) return 1;
                  if (a.finishedRank && b.finishedRank) return a.finishedRank - b.finishedRank;
                  return b.pos - a.pos;
                })
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2 rounded-xl border ${
                      p.id === activePlayer?.id ? 'bg-purple-950/70 border-yellow-400' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bangers text-sm text-yellow-400 w-4">
                          #{p.finishedRank || idx + 1}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs border border-white text-white"
                          style={{ backgroundColor: p.character.hexColor }}
                        >
                          {p.character.badgeSymbol}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">
                            {p.name} {p.isAi ? '(AI)' : ''}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-yellow-400">
                        {p.finishedRank ? `Rank #${p.finishedRank}` : `Tile ${p.pos}`}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-yellow-400"
                        style={{ width: `${Math.min(100, Math.max(1, p.pos))}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {intelTab === 'logs' && (
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {logs.slice(0, 30).map((log) => (
                <div key={log.id} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    {getLogBadge(log.type)}
                    <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                  </div>
                  <p className="leading-snug">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}

      {/* PRIMARY DICE CONTROLLER — Pinned firmly to the bottom-right corner */}
      <div className="fixed bottom-3 right-2 sm:bottom-4 sm:right-4 z-40 flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto select-none pb-safe">
        {/* The Main Glowing Character-Themed Dice Roll Action Card */}
        <div 
          className="flex flex-col gap-1 bg-slate-950/95 border-2 sm:border-3 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300"
          style={{ 
            borderColor: diceTheme.borderColor,
            boxShadow: `0 0 25px ${diceTheme.hudGlow}` 
          }}
        >
          {/* Active Character Dice Themed Badge Header */}
          <div className="flex items-center justify-between px-2 py-0.5 border-b border-slate-800/80 text-[10px] sm:text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-yellow-300 uppercase tracking-wider truncate">
              <span className="text-sm">{diceTheme.badgeSymbol}</span>
              <span className="font-bangers text-xs sm:text-sm tracking-wide text-white">{diceTheme.name}</span>
            </span>
            <span className="text-yellow-400 font-mono text-[9px] uppercase tracking-tighter hidden sm:inline">
              {diceTheme.tagline}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {activePlayer?.isAi ? (
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-purple-950/70 rounded-lg sm:rounded-xl border border-purple-500">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-spin" />
                <span className="font-bangers text-sm sm:text-base md:text-lg text-yellow-300 tracking-wide">
                  AI STAND USER ROLLING...
                </span>
              </div>
            ) : (
              <button
                onClick={onRollDice}
                disabled={isTurnBusy || (activePlayer?.missTurns ?? 0) > 0}
                className={`flex items-center gap-1.5 sm:gap-3 px-4 sm:px-7 md:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-bangers text-lg sm:text-2xl md:text-3xl tracking-wider uppercase border-2 sm:border-3 border-white shadow-2xl transition-all active:scale-95 touch-manipulation ${
                  isTurnBusy || (activePlayer?.missTurns ?? 0) > 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 cursor-pointer shadow-[0_4px_0_#000] hover:shadow-[0_0_25px_rgba(250,204,21,0.8)]'
                }`}
              >
                <span className="text-2xl sm:text-3xl md:text-4xl leading-none animate-pulse">
                  {getDiceDots(lastRoll)}
                </span>
                <span className="whitespace-nowrap">
                  {isDiceRolling ? 'ROLLING...' : isTurnBusy ? 'MOVE...' : 'ROLL DIE!'}
                </span>
                {lastRoll !== null && (
                  <span className="bg-slate-950 text-yellow-400 px-1.5 sm:px-2.5 py-0.2 sm:py-0.5 rounded sm:rounded-lg text-sm sm:text-xl border sm:border-2 border-yellow-400 font-mono font-black ml-0.5 sm:ml-1">
                    {lastRoll}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
