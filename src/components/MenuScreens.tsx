import React, { useState } from 'react';
import { Character, GameMode, DiceMode, Player, AiDifficulty } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Play, Users, RotateCcw, Settings, LogOut, Bot, Sparkles, Shuffle, Swords, UserCheck, Dices } from 'lucide-react';
import { sound } from '../services/audio';
import { getCharacterDiceTheme } from '../services/diceTheming';

interface MenuScreensProps {
  screen: 'menu' | 'character-select' | 'rules' | 'loading' | 'playing' | 'paused' | 'victory';
  winner: Player | null;
  finalPlayers: Player[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartVsAi: () => void;
  onStartPassAndPlay: () => void;
  onOpenRules: () => void;
  onCloseRules: () => void;
  onResume: () => void;
  onRestartMatch?: () => void;
  onReturnToMenu: () => void;
  onRequestExit?: () => void;
  onConfirmStartGame: (
    mode: GameMode,
    diceMode: DiceMode,
    playerConfigs: Array<{ name: string; character: Character; isAi: boolean }>,
    aiDifficulty?: AiDifficulty
  ) => void;
  onPlayAgain: () => void;
  onOpenSettings?: () => void;
}

export const MenuScreens: React.FC<MenuScreensProps> = ({
  screen,
  winner,
  finalPlayers,
  onStartVsAi,
  onStartPassAndPlay,
  onResume,
  onRestartMatch,
  onReturnToMenu,
  onRequestExit,
  onConfirmStartGame,
  onPlayAgain,
  onOpenSettings,
}) => {
  // Character Select state
  const [selectedNumPlayers, setSelectedNumPlayers] = useState<number>(2);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('normal');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([
    CHARACTERS[0], // Jotaro
    CHARACTERS[7], // DIO
  ]);

  // 1. MAIN HOME SCREEN
  if (screen === 'menu') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pt-safe pb-safe bg-radial from-purple-950 via-slate-950 to-black select-none overflow-y-auto font-oswald">
        {/* Anime Speedlines Backdrop */}
        <div className="absolute inset-0 comic-lines opacity-40 pointer-events-none" />

        {/* Floating Menacing Kanji - Hidden on small mobile screens to prevent visual clutter */}
        <div className="hidden sm:block absolute top-12 left-10 text-5xl font-bangers text-purple-500 opacity-60 animate-menacing pointer-events-none">
          ゴゴゴ
        </div>
        <div
          className="hidden sm:block absolute top-20 right-14 text-6xl font-bangers text-pink-500 opacity-60 animate-menacing pointer-events-none"
          style={{ animationDelay: '1s' }}
        >
          ゴゴゴ
        </div>
        <div
          className="hidden sm:block absolute bottom-16 left-16 text-5xl font-bangers text-yellow-400 opacity-60 animate-menacing pointer-events-none"
          style={{ animationDelay: '1.5s' }}
        >
          ゴゴゴ
        </div>

        {/* Top-Right Game Settings Button */}
        <div className="absolute top-3 sm:top-5 right-3 sm:right-5 z-20 pt-safe pr-safe">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/90 hover:bg-slate-800 text-yellow-300 border-2 border-yellow-400/80 hover:border-yellow-300 rounded-xl shadow-2xl transition-all cursor-pointer backdrop-blur-md active:scale-95 group"
            title="Game Settings: BGM, Rules & Stand Guide"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:rotate-45 transition-transform" />
            <span className="font-bangers text-sm sm:text-base tracking-wider hidden xs:inline sm:inline">
              SETTINGS
            </span>
          </button>
        </div>

        {/* Main JoJo Logo Title */}
        <div className="text-center z-10 my-auto py-6 max-w-xl">
          <h1 className="font-bangers text-5xl sm:text-7xl md:text-8xl text-sky-400 italic jojo-text-shadow leading-none">
            JOJO'S
          </h1>
          <h2 className="font-bangers text-3xl sm:text-5xl md:text-6xl text-fuchsia-500 jojo-text-shadow leading-tight">
            BIZARRE ADVENTURE
          </h2>
          {/* Official Subtitle: LAST STAND with Golden Stand Arrow behind it */}
          <div className="relative inline-flex items-center justify-center mt-3 sm:mt-5 my-1">
            {/* The Golden Stand Arrow SVG piercing right behind the word LAST STAND */}
            <div className="absolute inset-x-[-32px] sm:inset-x-[-48px] top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 filter drop-shadow-[0_0_15px_rgba(250,204,21,0.85)]">
              <svg
                viewBox="0 0 520 80"
                className="w-[120%] sm:w-[130%] h-auto max-h-16 sm:max-h-20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="standArrowGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="20%" stopColor="#facc15" />
                    <stop offset="55%" stopColor="#eab308" />
                    <stop offset="85%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="standArrowShaftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>
                  <filter id="standArrowGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Arrow Shaft */}
                <rect x="75" y="36" width="370" height="8" rx="4" fill="url(#standArrowShaftGrad)" stroke="#451a03" strokeWidth="1.5" />
                {/* Spiral grip engraving on shaft */}
                <line x1="120" y1="36" x2="135" y2="44" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                <line x1="150" y1="36" x2="165" y2="44" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                <line x1="360" y1="36" x2="375" y2="44" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                <line x1="390" y1="36" x2="405" y2="44" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />

                {/* Left Arrowhead (The Beetle Stand Arrow) */}
                <g filter="url(#standArrowGlow)">
                  {/* Ornate Arrowhead Blade */}
                  <path
                    d="M10 40 L65 14 C75 22, 85 24, 90 28 L78 40 L90 52 C85 56, 75 58, 65 66 Z"
                    fill="url(#standArrowGoldGrad)"
                    stroke="#451a03"
                    strokeWidth="2.5"
                  />
                  {/* Stand Beetle Motif Cutout */}
                  <path
                    d="M38 40 C38 34, 52 30, 60 35 C58 40, 58 40, 60 45 C52 50, 38 46, 38 40 Z"
                    fill="#451a03"
                    opacity="0.85"
                  />
                  <circle cx="50" cy="40" r="4.5" fill="#facc15" />
                  {/* Piercing central spine */}
                  <line x1="10" y1="40" x2="80" y2="40" stroke="#fef08a" strokeWidth="2" />
                </g>

                {/* Right Fletching / Tail (Ornate Golden Wing Feathers) */}
                <g filter="url(#standArrowGlow)">
                  {/* Top Feather */}
                  <path
                    d="M440 40 L495 18 C505 22, 510 32, 515 36 L465 40 Z"
                    fill="url(#standArrowGoldGrad)"
                    stroke="#451a03"
                    strokeWidth="2"
                  />
                  {/* Bottom Feather */}
                  <path
                    d="M440 40 L495 62 C505 58, 510 48, 515 44 L465 40 Z"
                    fill="url(#standArrowGoldGrad)"
                    stroke="#451a03"
                    strokeWidth="2"
                  />
                  {/* Feather quill detail lines */}
                  <line x1="460" y1="35" x2="480" y2="28" stroke="#fef08a" strokeWidth="1.5" />
                  <line x1="460" y1="45" x2="480" y2="52" stroke="#fef08a" strokeWidth="1.5" />
                  {/* End pommel bead */}
                  <circle cx="445" cy="40" r="5" fill="#facc15" stroke="#451a03" strokeWidth="1.5" />
                </g>
              </svg>
            </div>

            {/* The "LAST STAND" Title Plaque */}
            <div className="relative z-10 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-bangers text-2xl sm:text-4xl md:text-5xl px-7 sm:px-9 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-black -rotate-1 shadow-[0_5px_0_#000] sm:shadow-[0_8px_0_#000] tracking-widest uppercase flex items-center gap-2.5">
              <span className="text-red-700 text-xl sm:text-2xl drop-shadow">★</span>
              <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">LAST STAND</span>
              <span className="text-red-700 text-xl sm:text-2xl drop-shadow">★</span>
            </div>
          </div>

          {/* Main Action Buttons: Solo Player & Play with Friends */}
          <div className="flex flex-col gap-3 sm:gap-4 w-72 sm:w-80 max-w-full mx-auto mt-6 sm:mt-8">
            {/* Button 1: Play Solo Player */}
            <button
              onClick={() => {
                setIsAiMode(true);
                onStartVsAi();
              }}
              className="flex items-center justify-center gap-2.5 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 text-xl sm:text-2xl font-bangers tracking-wider uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:to-pink-500 text-white border-2 border-white rounded-xl shadow-xl cursor-pointer transition-all active:scale-95 hover:shadow-[0_0_25px_rgba(219,39,119,0.5)] touch-manipulation"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span>PLAY SOLO PLAYER</span>
            </button>

            {/* Button 2: Play with Friends */}
            <button
              onClick={() => {
                setIsAiMode(false);
                onStartPassAndPlay();
              }}
              className="flex items-center justify-center gap-2.5 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 text-xl sm:text-2xl font-bangers tracking-wider uppercase bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-2 border-white rounded-xl shadow-xl cursor-pointer transition-all active:scale-95 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] touch-manipulation"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>PLAY WITH FRIENDS</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to get unused character
  const getUnusedCharacter = (excludeList: Character[]) => {
    return CHARACTERS.find((c) => !excludeList.some((e) => e.id === c.id)) || CHARACTERS[0];
  };

  // Helper to pick random AI rival
  const handleRandomizeAi = (slotIdx: number) => {
    sound.playStandSummon();
    const currentExclude = selectedCharacters.filter((_: Character, idx: number) => idx !== slotIdx);
    const available = CHARACTERS.filter((c: Character) => !currentExclude.some((e: Character) => e.id === c.id));
    if (available.length > 0) {
      const randomChar = available[Math.floor(Math.random() * available.length)];
      const updated = [...selectedCharacters];
      updated[slotIdx] = randomChar;
      setSelectedCharacters(updated);
    }
  };

  // Quick preset rivalries
  const applyRivalryPreset = (char1Id: string, char2Id: string) => {
    sound.playStandSummon();
    const c1 = CHARACTERS.find((c) => c.id === char1Id) || CHARACTERS[0];
    const c2 = CHARACTERS.find((c) => c.id === char2Id) || CHARACTERS[7];
    const updated = [...selectedCharacters];
    updated[0] = c1;
    updated[1] = c2;
    setSelectedCharacters(updated);
    setActiveSlotIndex(0);
  };

  // 2. CHARACTER SELECTION SCREEN
  if (screen === 'character-select') {
    const activeSlotChar = selectedCharacters[activeSlotIndex] || CHARACTERS[0];
    const activeSlotIsUser = isAiMode ? activeSlotIndex === 0 : true;

    return (
      <div className="fixed inset-0 z-50 flex flex-col p-3 sm:p-4 md:p-6 pt-safe pb-safe bg-slate-950 select-none overflow-y-auto font-oswald text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-yellow-500 pb-2 sm:pb-3 mb-3 sm:mb-4 shrink-0">
          <div>
            <h2 className="font-bangers text-2xl sm:text-3xl md:text-4xl text-yellow-400">
              {isAiMode ? 'SOLO PLAYER: CHOOSE YOUR FIGHTER & AI RIVAL' : 'PASS & PLAY: SELECT DUELISTS'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {isAiMode
                ? 'Pick your Stand user and choose exactly which AI opponent you want to duel!'
                : 'Select Stand users for all local players'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReturnToMenu}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>

        {/* Player Count & Dice Mode Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-300">
              {isAiMode ? 'Match Format:' : 'Total Duelists:'}
            </span>
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setSelectedNumPlayers(num);
                  const updated = [...selectedCharacters];
                  while (updated.length < num) {
                    const unused = getUnusedCharacter(updated);
                    updated.push(unused);
                  }
                  setSelectedCharacters(updated.slice(0, num));
                  if (activeSlotIndex >= num) {
                    setActiveSlotIndex(num - 1);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedNumPlayers === num
                    ? 'bg-yellow-400 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isAiMode ? (num === 2 ? '1 vs 1 Duel' : `1 vs ${num - 1} AI Rivals`) : `${num} Players`}
              </button>
            ))}
          </div>

          {isAiMode ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-300">AI Difficulty:</span>
              <button
                type="button"
                onClick={() => setAiDifficulty('easy')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  aiDifficulty === 'easy'
                    ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Easy: Relaxed AI with moderate moves & lower ability rate"
              >
                Easy
              </button>
              <button
                type="button"
                onClick={() => setAiDifficulty('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  aiDifficulty === 'normal'
                    ? 'bg-yellow-500 text-slate-950 font-black shadow ring-1 ring-yellow-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Normal: Balanced Stand User match"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setAiDifficulty('hard')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  aiDifficulty === 'hard'
                    ? 'bg-red-600 text-white shadow ring-1 ring-red-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Hard: Tough challenge for veteran Stand users"
              >
                Hard
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-mono bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
              <Dices className="w-3.5 h-3.5 text-yellow-400" />
              <span>Standard 6-Sided Roll (1-6)</span>
            </div>
          )}
        </div>

        {/* Solo Mode: Iconic Rivalries Quick Setup */}
        {isAiMode && (
          <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-2.5 mb-4 shrink-0 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-400 font-bangers tracking-wider mr-1">
              <Swords className="w-3.5 h-3.5 text-yellow-400" />
              <span>ICONIC DUELS:</span>
            </div>
            <button
              onClick={() => applyRivalryPreset('jotaro', 'dio')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-red-500/60 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>⭐️ Jotaro vs 🧛 DIO</span>
            </button>
            <button
              onClick={() => applyRivalryPreset('josuke', 'kira')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-pink-500/60 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>💎 Josuke vs 💣 Kira</span>
            </button>
            <button
              onClick={() => applyRivalryPreset('giorno', 'diavolo')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-yellow-500/60 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🐞 Giorno vs ⏳ Diavolo</span>
            </button>
            <button
              onClick={() => applyRivalryPreset('jonathan', 'dio')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-blue-500/60 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>☀️ Jonathan vs 🧛 DIO</span>
            </button>
            <button
              onClick={() => applyRivalryPreset('jolyne', 'dio')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-cyan-500/60 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🦋 Jolyne vs 🧛 DIO</span>
            </button>
            <button
              onClick={() => handleRandomizeAi(1)}
              className="ml-auto px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 text-yellow-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3 text-yellow-400" />
              <span>🎲 Random AI Opponent</span>
            </button>
          </div>
        )}

        {/* Selected Players Slots with Active Target Highlighter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 shrink-0">
          {Array.from({ length: selectedNumPlayers }).map((_, idx) => {
            const char = selectedCharacters[idx] || CHARACTERS[idx % CHARACTERS.length];
            const isUserPlayer = isAiMode ? idx === 0 : true;
            const isTargeted = activeSlotIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => {
                  sound.playStepHop();
                  setActiveSlotIndex(idx);
                }}
                className={`border-2 rounded-xl p-2 sm:p-3 flex flex-col justify-between shadow-lg relative overflow-hidden cursor-pointer transition-all ${
                  isTargeted
                    ? 'border-yellow-400 ring-2 ring-yellow-400 bg-slate-900 scale-[1.01] sm:scale-[1.02] shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-600 hover:bg-slate-850'
                }`}
              >
                {/* Active Assignment Indicator Tag */}
                {isTargeted && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-bl-lg font-bangers text-[9px] sm:text-[10px] tracking-wider uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    <span>ACTIVE</span>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <div
                    className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold border-2 border-white shadow text-white shrink-0"
                    style={{ backgroundColor: char.hexColor }}
                  >
                    {char.badgeSymbol}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded font-bold uppercase inline-flex items-center gap-0.5 ${
                          isUserPlayer
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : 'bg-purple-950 text-purple-300 border border-purple-600'
                        }`}
                      >
                        {isUserPlayer ? (
                          <>
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>P1 (You)</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-2.5 h-2.5" />
                            <span>AI {selectedNumPlayers > 2 ? `#${idx}` : ''}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="font-bangers text-base sm:text-xl text-white leading-none truncate">{char.name}</h3>
                    <span className="text-[10px] sm:text-[11px] text-yellow-300 font-mono truncate block">{char.stand}</span>
                  </div>
                </div>

                <div className="text-[9px] sm:text-[10px] text-slate-300 bg-slate-950 p-1.5 sm:p-2 rounded border border-slate-800 italic truncate mb-1.5 sm:mb-2">
                  "{char.standCry}"
                </div>

                {/* Slot Action Row */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="font-bold text-yellow-400/90 truncate">
                    {isTargeted ? '👈 Pick Below' : 'Tap to Edit'}
                  </span>
                  {!isUserPlayer && isAiMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRandomizeAi(idx);
                      }}
                      className="px-1.5 sm:px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[9px] sm:text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      title="Pick a random AI opponent"
                    >
                      <Shuffle className="w-2.5 h-2.5 text-yellow-400" />
                      <span className="hidden xs:inline">Random</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Roster Character Selection Grid */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bangers text-lg sm:text-xl md:text-2xl text-yellow-400">
              {activeSlotIsUser
                ? '⭐ ROSTER — SELECT YOUR FIGHTER:'
                : `🤖 ROSTER — SELECT AI OPPONENT ${selectedNumPlayers > 2 && activeSlotIndex > 1 ? '#' + activeSlotIndex : ''}:`}
            </h3>
            <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:inline">
              (Assigning: <strong className="text-white">{activeSlotIsUser ? 'You' : `AI Rival`}</strong>)
            </span>
          </div>

          <span className="text-[10px] sm:text-xs font-mono text-purple-300">
            {CHARACTERS.length} Fighters
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 flex-1 mb-4 sm:mb-6">
          {CHARACTERS.map((char) => {
            const isAssignedToActiveSlot = selectedCharacters[activeSlotIndex]?.id === char.id;
            const assignedSlotIndex = selectedCharacters.findIndex((c: Character) => c?.id === char.id);
            const isAssignedToUser = assignedSlotIndex === 0;
            const isAssignedToAi = assignedSlotIndex > 0 && isAiMode;

            return (
              <button
                key={char.id}
                onClick={() => {
                  sound.playStandSummon();
                  const updated = [...selectedCharacters];

                  // If this char is already in another slot, swap them!
                  if (assignedSlotIndex !== -1 && assignedSlotIndex !== activeSlotIndex) {
                    updated[assignedSlotIndex] = updated[activeSlotIndex] || char;
                  }
                  updated[activeSlotIndex] = char;
                  setSelectedCharacters(updated);

                  // If in AI mode and user just picked Player 1, helpfully switch focus to pick the AI opponent!
                  if (isAiMode && activeSlotIndex === 0) {
                    setActiveSlotIndex(1);
                  }
                }}
                className={`p-2 sm:p-3 rounded-xl border-2 flex flex-col items-center text-center transition-all cursor-pointer relative overflow-hidden touch-manipulation ${
                  isAssignedToActiveSlot
                    ? 'border-yellow-400 bg-yellow-400/20 scale-102 sm:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.4)] z-10'
                    : assignedSlotIndex !== -1
                    ? 'border-purple-500/80 bg-slate-900/90 hover:border-yellow-400'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-850'
                }`}
              >
                {/* Assignment Tag Badge */}
                {assignedSlotIndex !== -1 && (
                  <div
                    className={`absolute top-1 right-1 sm:top-1.5 sm:right-1.5 px-1 sm:px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${
                      isAssignedToUser
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : isAssignedToAi
                        ? 'bg-purple-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isAssignedToUser ? 'YOU' : isAssignedToAi ? `AI ${selectedNumPlayers > 2 ? '#' + assignedSlotIndex : ''}` : `P${assignedSlotIndex + 1}`}
                  </div>
                )}

                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 border-white shadow mb-1.5 sm:mb-2"
                  style={{ backgroundColor: char.hexColor }}
                >
                  {char.badgeSymbol}
                </div>
                <span className="font-bangers text-sm sm:text-base text-white leading-tight">{char.name}</span>
                <span className="text-[9px] sm:text-[10px] text-yellow-300 font-mono mt-0.5 truncate max-w-full">
                  {char.stand}
                </span>
                <span className="text-[8px] sm:text-[9px] text-amber-300/90 font-mono mt-0.5 truncate max-w-full flex items-center justify-center gap-1">
                  <span>{getCharacterDiceTheme(char.id).badgeSymbol}</span>
                  <span className="truncate">{getCharacterDiceTheme(char.id).name}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Sticky Bottom Battle Start Bar */}
        <div className="sticky bottom-0 bg-slate-950/98 border-t-2 border-yellow-500/80 -mx-3 -mb-3 sm:-mx-4 sm:-mb-4 md:-mx-6 md:-mb-6 p-2.5 sm:p-3 md:p-4 z-40 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="text-xs sm:text-sm text-slate-300 text-center sm:text-left">
            <span className="text-slate-400">Matchup: </span>
            <strong className="text-emerald-400 font-bold">{selectedCharacters[0]?.name}</strong>
            <span className="text-yellow-400 font-bold mx-1.5">VS</span>
            <strong className="text-purple-400 font-bold">
              {selectedCharacters
                .slice(1, selectedNumPlayers)
                .map((c: Character) => c?.name)
                .join(' & ')}
            </strong>
          </div>

          <button
            onClick={() => {
              const count = selectedNumPlayers;
              const configs = selectedCharacters.slice(0, count).map((char: Character, idx: number) => ({
                name: char.name,
                character: char,
                isAi: isAiMode ? idx > 0 : false,
              }));
              onConfirmStartGame(isAiMode ? 'ai' : 'pass-and-play', 'auto', configs, aiDifficulty);
            }}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-950 font-bangers text-xl sm:text-2xl rounded-xl shadow-[0_4px_0_#000] border-2 border-white flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 touch-manipulation"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            <span>COMMENCE BATTLE!</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. PAUSE MENU (DURING GAMEPLAY)
  if (screen === 'paused') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-oswald text-white animate-in fade-in duration-200">
        <div className="bg-slate-950 border-4 border-yellow-500 rounded-2xl max-w-sm w-full p-6 shadow-2xl jojo-box-gold flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-3xl mb-3">
            ⏸️
          </div>

          <h2 className="font-bangers text-3xl text-yellow-400 tracking-wider mb-1">
            MATCH PAUSED
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Stand clash is suspended. What would you like to do?
          </p>

          <div className="flex flex-col gap-3 w-full">
            {/* Button 1: Continue Match */}
            <button
              onClick={onResume}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bangers text-xl rounded-xl border-2 border-white shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>CONTINUE MATCH</span>
            </button>

            {/* Button 2: Game Settings (BGM, Rules, Stands) */}
            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
              }}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-bangers text-lg rounded-xl border-2 border-yellow-500/70 hover:border-yellow-400 shadow cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5 text-yellow-400" />
              <span>GAME SETTINGS</span>
            </button>

            {/* Button 3: Restart Match */}
            {onRestartMatch && (
              <button
                onClick={onRestartMatch}
                className="w-full py-2.5 px-4 bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-bangers text-lg rounded-xl border border-purple-500 shadow cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-purple-300" />
                <span>RESTART MATCH</span>
              </button>
            )}

            {/* Button 4: Exit to Main Menu with Abandon Warning */}
            <button
              onClick={() => {
                if (onRequestExit) {
                  onRequestExit();
                } else {
                  onReturnToMenu();
                }
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl border border-slate-600 shadow cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>EXIT TO MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. VICTORY / POST-GAME SCREEN (AFTER COMPLETING A GAME)
  if (screen === 'victory' && winner) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-radial from-yellow-950 via-purple-950 to-black select-none font-oswald text-white animate-in zoom-in-95 duration-200">
        <div className="text-center mb-5">
          <h1 className="font-bangers text-5xl md:text-7xl text-yellow-400 jojo-text-gold animate-bounce leading-tight">
            MADE IT TO HEAVEN!
          </h1>
          <div
            className="inline-block px-6 py-2 rounded-xl border-4 border-white shadow-2xl mt-2"
            style={{ backgroundColor: winner.character.hexColor }}
          >
            <span className="font-bangers text-2xl md:text-4xl text-white uppercase tracking-wider">
              {winner.name} TRIUMPHS!
            </span>
          </div>
          <p className="text-xs md:text-sm text-yellow-200 mt-2.5 italic font-semibold max-w-md mx-auto">
            "{winner.character.quote}"
          </p>
        </div>

        {/* Podium Standings Card */}
        <div className="bg-slate-950/95 border-2 border-yellow-500 rounded-2xl p-4 max-w-md w-full mb-6 shadow-2xl">
          <h3 className="font-bangers text-lg text-yellow-400 text-center mb-2.5 border-b border-slate-800 pb-1.5">
            FINAL STANDINGS
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {[...finalPlayers]
              .sort((a, b) => {
                if (a.finishedRank && !b.finishedRank) return -1;
                if (!a.finishedRank && b.finishedRank) return 1;
                if (a.finishedRank && b.finishedRank) return a.finishedRank - b.finishedRank;
                return b.pos - a.pos;
              })
              .map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bangers text-base text-yellow-400 w-5">
                      #{p.finishedRank || idx + 1}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-white text-white"
                      style={{ backgroundColor: p.character.hexColor }}
                    >
                      {p.character.badgeSymbol}
                    </div>
                    <span className="text-xs font-bold text-white">{p.name}</span>
                  </div>

                  <span className="text-xs font-mono font-bold text-yellow-400">
                    Tile {p.pos}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons: PLAY AGAIN (only after completing a game!) & MAIN MENU */}
        <div className="flex items-center justify-center gap-3 w-full max-w-md">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bangers text-2xl rounded-xl shadow-xl cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95 font-black border-2 border-white"
          >
            <RotateCcw className="w-6 h-6" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base rounded-xl border border-slate-600 shadow cursor-pointer transition-colors"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  return null;
};
