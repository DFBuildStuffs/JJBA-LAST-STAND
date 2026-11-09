import React, { useState } from 'react';
import { Volume2, VolumeX, Music, BookOpen, Sparkles, X, Play, Pause, Shield, Zap, Swords, Flame, Crosshair } from 'lucide-react';
import { sound, MUSIC_TRACKS, MusicTrack } from '../services/audio';
import { CHARACTERS } from '../data/characters';
import { SPECIAL_CELLS } from '../data/specialCells';
import { getCharacterDiceTheme } from '../services/diceTheming';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentTrack: MusicTrack;
  isBgmPlaying: boolean;
  onSelectTrack: (trackId: string) => void;
  onToggleBgm: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  currentTrack,
  isBgmPlaying,
  onSelectTrack,
  onToggleBgm,
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'rules' | 'stands'>('audio');
  const [selectedCharId, setSelectedCharId] = useState<string>('jotaro');

  if (!isOpen) return null;

  const selectedChar = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-slate-950 border-3 border-yellow-500 rounded-2xl shadow-[0_0_35px_rgba(234,179,8,0.3)] flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="font-bangers text-2xl text-yellow-400 tracking-wide leading-none">
                GAME SETTINGS
              </h2>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                AUDIO • RULES • STAND DIRECTORY
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-3 md:px-4 pt-2 gap-1.5 md:gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 font-bangers text-sm md:text-base tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'audio'
                ? 'border-yellow-400 text-yellow-300 bg-yellow-400/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>MUSIC & BGM</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 font-bangers text-sm md:text-base tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'rules'
                ? 'border-yellow-400 text-yellow-300 bg-yellow-400/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>GAME RULES</span>
          </button>

          <button
            onClick={() => setActiveTab('stands')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 font-bangers text-sm md:text-base tracking-wider border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'stands'
                ? 'border-yellow-400 text-yellow-300 bg-yellow-400/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>STAND GUIDE</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {/* TAB 1: MUSIC & BGM */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              {/* Master Sound Effects Toggle */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <h3 className="font-bangers text-lg text-white leading-none">
                    SOUND EFFECTS (SFX)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Iconic anime punch barrages, time-stop chimes, dice rolls, and Stand cry sound effects.
                  </p>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`px-4 py-2 rounded-xl font-bangers text-sm flex items-center gap-2 border transition-all cursor-pointer ${
                    soundEnabled
                      ? 'bg-green-600/30 text-green-300 border-green-500/80 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-red-950/40 text-red-400 border-red-600/60'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEnabled ? 'SFX ENABLED' : 'SFX MUTED'}</span>
                </button>
              </div>

              {/* BGM Player Bar */}
              <div className="bg-purple-950/40 border-2 border-purple-500/60 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onToggleBgm}
                    className="w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                    title={isBgmPlaying ? 'Pause BGM' : 'Play BGM'}
                  >
                    {isBgmPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <span className="text-[10px] text-yellow-300 uppercase font-mono tracking-wider block">
                      NOW PLAYING {isBgmPlaying ? '▶' : '⏸'}
                    </span>
                    <h3 className="font-bangers text-xl text-white leading-tight">
                      {currentTrack.title}
                    </h3>
                    <span className="text-xs text-purple-300">{currentTrack.subtitle}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">AUDIO SOURCE</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    Boolean(currentTrack.src)
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-purple-900 text-purple-200 border-purple-500'
                  }`}>
                    {Boolean(currentTrack.src) ? 'ORIGINAL OST' : 'SYNTHESIZED BGM'}
                  </span>
                </div>
              </div>

              {/* Track Playlist */}
              <div>
                <h3 className="font-bangers text-sm text-yellow-400 uppercase tracking-wider mb-2">
                  SELECT BATTLE THEME:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MUSIC_TRACKS.map((t) => {
                    const isSelected = currentTrack.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTrack(t.id);
                          if (!isBgmPlaying) onToggleBgm();
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-yellow-500/20 border-yellow-400 text-white shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">{t.coverEmoji || (isSelected && isBgmPlaying ? '🔊' : '🎵')}</span>
                          <div className="min-w-0">
                            <span className="font-bangers text-sm block leading-tight text-white truncate">
                              {t.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              {t.tag} • {t.subtitle}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-yellow-400 uppercase font-mono px-2 py-0.5 rounded bg-yellow-400/20 border border-yellow-500/50 shrink-0 ml-2">
                            {isBgmPlaying ? 'PLAYING' : 'READY'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAME RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3.5 text-slate-200">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bangers text-base text-yellow-400 mb-1">
                  1. VICTORY OBJECTIVE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Be the first Stand user to reach the final goal tile (Tile 100). Exact count bounce rule applies—if you overshoot, you bounce backwards!
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bangers text-base text-yellow-400 mb-2">
                  2. TACTICAL DRIVE STANCES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-red-950/40 border border-red-700/60">
                    <div className="flex items-center gap-1 text-red-300 font-bangers text-xs mb-1">
                      <Flame className="w-3.5 h-3.5 text-yellow-400" />
                      <span>ORA RUSH</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Sprint forward! Adds a +2 bonus tile distance to your dice roll.
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-700/60">
                    <div className="flex items-center gap-1 text-purple-300 font-bangers text-xs mb-1">
                      <Crosshair className="w-3.5 h-3.5 text-pink-400" />
                      <span>PRECISION</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Careful tactical calculation. Move exactly the number rolled without overshoot.
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-700/60">
                    <div className="flex items-center gap-1 text-blue-300 font-bangers text-xs mb-1">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>HAMON GUARD</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Move 1-3 safe tiles, deploy a Stand Shield to negate traps, and restore +20 SP!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bangers text-base text-yellow-400 mb-1">
                  3. STAND CLASH DUELS
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Landing within 1 tile of a rival triggers an intense 4-second button-mashing Stand Clash! The victor knocks the loser backwards 3 tiles and gains +25 SP.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bangers text-base text-yellow-400 mb-1">
                  4. SPECIAL TILES LEGEND
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <div className="p-2 bg-green-950/60 border border-green-600 rounded">
                    <span className="text-[10px] text-green-300 font-bold block">⚡ SHORTCUTS</span>
                    <span className="text-[10px] text-slate-300">Warp 10-25 tiles forward toward Heaven</span>
                  </div>
                  <div className="p-2 bg-red-950/60 border border-red-600 rounded">
                    <span className="text-[10px] text-red-300 font-bold block">⚠️ HAZARDS</span>
                    <span className="text-[10px] text-slate-300">Traps that knock you back or freeze your turn</span>
                  </div>
                  <div className="p-2 bg-purple-950/60 border border-purple-600 rounded">
                    <span className="text-[10px] text-purple-300 font-bold block">⏳ THE WORLD</span>
                    <span className="text-[10px] text-slate-300">Stops time for 2 turns</span>
                  </div>
                  <div className="p-2 bg-amber-950/60 border border-amber-600 rounded">
                    <span className="text-[10px] text-amber-300 font-bold block">🌟 STAND ARROW</span>
                    <span className="text-[10px] text-slate-300">Grants full SP and bonus dice roll</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STAND GUIDE */}
          {activeTab === 'stands' && (
            <div className="space-y-4">
              {/* Character Selector Chips */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      selectedCharId === char.id
                        ? 'bg-yellow-400 text-slate-950 border-white shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>{char.badgeSymbol}</span>
                    <span>{char.name}</span>
                  </button>
                ))}
              </div>

              {/* Selected Character Stand Card Showcase */}
              <div
                className="bg-slate-900 border-2 rounded-xl p-4 shadow-xl"
                style={{ borderColor: selectedChar.hexColor }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow text-white font-bold"
                      style={{ backgroundColor: selectedChar.hexColor }}
                    >
                      {selectedChar.badgeSymbol}
                    </div>
                    <div>
                      <h3 className="font-bangers text-2xl text-white leading-none">
                        {selectedChar.name}
                      </h3>
                      <span className="text-xs font-bold text-yellow-300">
                        Stand: {selectedChar.stand} ({selectedChar.part})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">STAND CRY</span>
                    <span className="font-bangers text-lg text-yellow-400">
                      {selectedChar.standCry}
                    </span>
                  </div>
                </div>

                <blockquote className="italic text-xs text-slate-300 mb-3 bg-slate-950/80 p-2 rounded border border-slate-800">
                  "{selectedChar.quote}"
                </blockquote>

                {/* Abilities List */}
                <h4 className="font-bangers text-sm text-yellow-400 uppercase tracking-wider mb-2">
                  STAND ABILITIES:
                </h4>
                <div className="space-y-2">
                  {selectedChar.abilities.map((ab) => (
                    <div
                      key={ab.id}
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bangers text-sm text-white">{ab.name}</span>
                          <span className="text-[10px] font-mono text-purple-300 uppercase">
                            ({ab.standName})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{ab.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-yellow-400 block">
                          {ab.spCost} SP
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {ab.cooldownTurns}T Cooldown
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Character Custom 3D Die Showcase */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950 border border-yellow-500/40 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCharacterDiceTheme(selectedChar.id).badgeSymbol}</span>
                    <div>
                      <span className="font-bangers text-base text-yellow-300 block leading-tight">
                        UNIQUE 3D DIE: {getCharacterDiceTheme(selectedChar.id).name}
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono">
                        "{getCharacterDiceTheme(selectedChar.id).tagline}" • Thematic Stand Emblem on Ace (1)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 uppercase font-bold shrink-0">
                    PHYSICAL 3D
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bangers text-base rounded-lg transition-transform active:scale-95 cursor-pointer shadow font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
