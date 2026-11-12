import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  BookOpen,
  Sparkles,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Disc3,
  Sliders,
  Radio,
  Shield,
  Zap,
  Swords,
  Flame,
  Crosshair,
} from 'lucide-react';
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
  const [bgmVolume, setBgmVolume] = useState<number>(sound.bgmVolume);

  if (!isOpen) return null;

  const selectedChar = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];

  const handleNextTrack = () => {
    const nextId = sound.nextTrack();
    onSelectTrack(nextId);
  };

  const handlePrevTrack = () => {
    const prevId = sound.prevTrack();
    onSelectTrack(prevId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBgmVolume(val);
    sound.setBgmVolume(val);
  };

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
              {/* JOJO STAND JUKEBOX DECK */}
              <div className="bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 border-2 border-yellow-500/80 rounded-2xl p-4 md:p-5 shadow-[0_0_25px_rgba(234,179,8,0.2)] relative overflow-hidden">
                {/* Background Vinyl Glow */}
                <div className="absolute -top-12 -right-12 w-44 h-44 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 pb-4 border-b border-slate-800">
                  {/* Vinyl Record Visual & Track Info */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="relative shrink-0">
                      <div
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-950 border-3 border-yellow-400 flex items-center justify-center shadow-xl ${
                          isBgmPlaying ? 'animate-spin' : ''
                        }`}
                        style={{ animationDuration: '4s' }}
                      >
                        <Disc3 className="w-8 h-8 text-yellow-400" />
                        <div className="absolute inset-0 m-auto w-3.5 h-3.5 bg-yellow-400 rounded-full border border-slate-950" />
                      </div>
                      {isBgmPlaying && (
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Radio className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />
                        <span className="text-[10px] text-yellow-300 uppercase font-mono tracking-wider font-bold">
                          STAND JUKEBOX • {isBgmPlaying ? 'PLAYING NOW' : 'PAUSED'}
                        </span>
                      </div>
                      <h3 className="font-bangers text-xl md:text-2xl text-white tracking-wide leading-tight truncate">
                        {currentTrack.title}
                      </h3>
                      <p className="text-xs text-purple-300 font-mono truncate">
                        {currentTrack.artist} — {currentTrack.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Player Transport Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Previous Track */}
                    <button
                      onClick={handlePrevTrack}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-400 hover:text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer border border-slate-700"
                      title="Previous Track"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    {/* Play / Pause Toggle */}
                    <button
                      onClick={onToggleBgm}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 hover:from-yellow-400 hover:to-amber-200 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-transform active:scale-95 cursor-pointer shrink-0 font-bold"
                      title={isBgmPlaying ? 'Pause BGM' : 'Play BGM'}
                    >
                      {isBgmPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Next Track */}
                    <button
                      onClick={handleNextTrack}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-400 hover:text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer border border-slate-700"
                      title="Next Track"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* BGM Volume Slider & Equalizer Bar */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-mono text-slate-300 shrink-0 uppercase">
                      BGM Volume: {Math.round(bgmVolume * 100)}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={bgmVolume}
                      onChange={handleVolumeChange}
                      className="w-full sm:w-36 accent-yellow-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    Switch tracks anytime during match • Reacts to Stand themes
                  </span>
                </div>
              </div>

              {/* Master Sound Effects Toggle */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <h3 className="font-bangers text-lg text-white leading-none">
                    SOUND EFFECTS (SFX)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Punch barrages, Stand cries, special tile effects, and dice rolls.
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

              {/* Jukebox Track Playlist */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-bangers text-sm md:text-base text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                    <Disc3 className="w-4 h-4 text-yellow-400" />
                    <span>JUKEBOX TRACK SELECTOR ({MUSIC_TRACKS.length} TRACKS):</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Instant Switch in Real-Time
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {MUSIC_TRACKS.map((t) => {
                    const isSelected = currentTrack.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTrack(t.id);
                          if (!isBgmPlaying) onToggleBgm();
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-r from-yellow-500/25 to-purple-900/40 border-yellow-400 text-white shadow-[0_0_20px_rgba(234,179,8,0.25)]'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/90'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 border ${
                              isSelected
                                ? 'bg-yellow-400/20 border-yellow-400'
                                : 'bg-slate-800 border-slate-700'
                            }`}
                          >
                            {isSelected && isBgmPlaying ? (
                              <div className="flex items-end gap-0.5 h-4">
                                <span className="w-1 bg-yellow-400 animate-pulse h-3" />
                                <span className="w-1 bg-yellow-400 animate-pulse h-4" />
                                <span className="w-1 bg-yellow-400 animate-pulse h-2" />
                              </div>
                            ) : (
                              <span>{t.coverEmoji || '🎵'}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="font-bangers text-sm md:text-base block leading-tight text-white truncate group-hover:text-yellow-300 transition-colors">
                              {t.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block truncate">
                              {t.tag} • {t.subtitle}
                            </span>
                            <span className="text-[10px] text-purple-300/80 line-clamp-1 mt-0.5">
                              {t.description}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2 text-right">
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-yellow-300 uppercase font-mono px-2 py-1 rounded bg-yellow-400/20 border border-yellow-500/60 block">
                              {isBgmPlaying ? '▶ PLAYING' : '⏸ READY'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              PLAY
                            </span>
                          )}
                        </div>
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
                <h3 className="font-bangers text-base text-yellow-400 mb-1">
                  2. AUTHENTIC 6-SIDED DICE ROLLING
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every player rolls a standard 6-sided die (values 1–6). You move forward the exact number rolled—for example, rolling a 6 from Tile 1 moves you straight to Tile 7! Rolling an Ace (1) unleashes your character's signature Stand Emblem.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bangers text-base text-yellow-400 mb-1">
                  3. STAND ABILITIES & TACTICAL SP
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use your character's unique Stand Ability cards (such as Star Platinum's Time Stop or Gold Experience's Life Spring) to bypass hazards or hinder opponents. Stand Power (SP) replenishes steadily each turn.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                <h3 className="font-bangers text-base text-yellow-400 mb-1">
                  4. STAND CLASH DUELS & BALANCED AI
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Landing on the exact same tile as a rival triggers an intense Stand Clash! Mash the barrage button to overpower them. AI difficulty can be set to Easy, Normal, or Hard for fair, competitive matches.
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
