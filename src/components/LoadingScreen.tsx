import React, { useState, useEffect } from 'react';
import { Player } from '../types/game';
import { sound } from '../services/audio';
import { Sparkles, Swords, Zap, ChevronRight } from 'lucide-react';
import { getCharacterDiceTheme } from '../services/diceTheming';

interface LoadingScreenProps {
  players: Player[];
  onComplete: () => void;
}

const BATTLE_TIPS = [
  'THE STAND ARROW: Pierces dormant souls to awaken immense Stand energy and grants a bonus dice roll!',
  'STAND CLASH: Landing on an opponent triggers an intense rapid-tapping Stand Clash duel!',
  'ORA RUSH STANCE: Grants +2 bonus movement distance to aggressively overtake your rivals!',
  'HAMON GUARD STANCE: Deploys a Stand Shield to negate hazard traps and restores +20 SP!',
  'TIME STOP: DIO and Jotaro can freeze all opponents on the board in monochrome suspension!',
  'CUSTOM 3D DICE: Each Stand User wields a physical 3D die styled with their signature Stand emblem!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ players, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [statusText, setStatusText] = useState('AWAKENING STAND ENERGIES...');

  const player1 = players[0] || null;
  const player2 = players[1] || null;

  const p1Dice = player1 ? getCharacterDiceTheme(player1.character.id) : null;
  const p2Dice = player2 ? getCharacterDiceTheme(player2.character.id) : null;

  useEffect(() => {
    // Play initial Stand summon chime
    sound.playStandSummon();

    const statuses = [
      'AWAKENING STAND ENERGIES...',
      'FORGING 3D STAND ARENA...',
      'CALIBRATING STAND ARROW FREQUENCIES...',
      'SYNCHRONIZING RIVAL WILLPOWER...',
      'COMMENCING STAND BATTLE!',
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
        const statusIdx = Math.min(statuses.length - 1, Math.floor((currentProgress / 100) * statuses.length));
        setStatusText(statuses[statusIdx]);
      } else {
        clearInterval(interval);
        // Play clash sound on finish and proceed
        sound.playClashHit();
        setTimeout(onComplete, 350);
      }
    }, 100);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % BATTLE_TIPS.length);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sound.playStepHop();
    onComplete();
  };

  return (
    <div 
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950 text-white select-none overflow-hidden cursor-pointer"
    >
      {/* Background Comic Speedlines & Halftone */}
      <div className="absolute inset-0 comic-lines opacity-40 pointer-events-none" />
      <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

      {/* Floating Menacing Kanji */}
      <div className="absolute top-8 left-8 text-5xl sm:text-7xl font-bangers text-purple-500/60 animate-menacing pointer-events-none">
        ゴゴゴ
      </div>
      <div className="absolute bottom-16 right-8 text-6xl sm:text-8xl font-bangers text-yellow-400/50 animate-menacing pointer-events-none">
        ゴゴゴ
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 pt-safe flex flex-col items-center mt-2 sm:mt-4 text-center">
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/20 border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="font-bangers text-sm sm:text-base text-yellow-300 tracking-widest uppercase">
            STAND CLASH MATCHUP
          </span>
        </div>
        <h1 className="font-bangers text-3xl sm:text-5xl text-white tracking-wider mt-2 jojo-text-shadow">
          STAND BY FOR BATTLE
        </h1>
      </div>

      {/* Center Duelist Face-Off Preview */}
      <div className="relative z-10 w-full max-w-2xl my-auto py-4">
        {player1 && (
          <div className="flex items-center justify-between gap-3 sm:gap-6 bg-slate-900/90 border-3 border-yellow-400/80 p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* The Golden Stand Arrow Watermark in Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <svg viewBox="0 0 400 120" className="w-full h-full text-yellow-400 fill-current">
                <path d="M20 60 L120 20 L100 50 L340 50 L340 70 L100 70 L120 100 Z" />
              </svg>
            </div>

            {/* Duelist 1 (Player 1 - Left) */}
            <div className="flex flex-col items-center flex-1 text-center relative z-10">
              <div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-5xl border-3 sm:border-4 border-white shadow-2xl mb-2 transition-transform transform hover:scale-105"
                style={{ backgroundColor: player1.character.hexColor }}
              >
                {player1.character.badgeSymbol}
              </div>
              <span className="font-bangers text-lg sm:text-2xl text-white leading-tight">
                {player1.name}
              </span>
              <span className="text-xs sm:text-sm font-bold text-yellow-400 uppercase tracking-wide">
                {player1.character.stand}
              </span>
              {p1Dice && (
                <span className="text-[10px] sm:text-xs text-slate-300 font-mono mt-1 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                  <span>{p1Dice.badgeSymbol}</span>
                  <span className="truncate">{p1Dice.name}</span>
                </span>
              )}
            </div>

            {/* Center VS Clash Emblem */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2 relative z-10">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-xl animate-pulse">
                <Swords className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <span className="font-bangers text-2xl sm:text-4xl text-yellow-400 jojo-text-shadow mt-1">
                VS
              </span>
            </div>

            {/* Duelist 2 (Rival - Right) */}
            {player2 ? (
              <div className="flex flex-col items-center flex-1 text-center relative z-10">
                <div
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-5xl border-3 sm:border-4 border-white shadow-2xl mb-2 transition-transform transform hover:scale-105"
                  style={{ backgroundColor: player2.character.hexColor }}
                >
                  {player2.character.badgeSymbol}
                </div>
                <span className="font-bangers text-lg sm:text-2xl text-white leading-tight">
                  {player2.name}
                </span>
                <span className="text-xs sm:text-sm font-bold text-yellow-400 uppercase tracking-wide">
                  {player2.character.stand}
                </span>
                {p2Dice && (
                  <span className="text-[10px] sm:text-xs text-slate-300 font-mono mt-1 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                    <span>{p2Dice.badgeSymbol}</span>
                    <span className="truncate">{p2Dice.name}</span>
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center flex-1 text-center relative z-10">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-3xl text-slate-400 mb-2">
                  ?
                </div>
                <span className="font-bangers text-lg sm:text-xl text-slate-400">RIVAL STAND</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Loading Progress & Battle Tips */}
      <div className="relative z-10 w-full max-w-xl pb-safe mb-2 sm:mb-4 flex flex-col items-center gap-3">
        {/* Progress Bar with JoJo Speedlines */}
        <div className="w-full">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-yellow-400 mb-1 px-1">
            <span className="tracking-wider">{statusText}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-4 sm:h-5 bg-slate-900 rounded-full border-2 border-yellow-400/90 overflow-hidden p-0.5 shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 rounded-full transition-all duration-100 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dynamic JoJo Lore & Battle Tip */}
        <div className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 sm:p-3 text-center">
          <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
            {BATTLE_TIPS[tipIndex]}
          </p>
        </div>

        {/* Tap to skip hint */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 font-mono tracking-wider hover:text-yellow-300 transition-colors">
          <span>TAP ANYWHERE TO COMMENCE INSTANTLY</span>
          <ChevronRight className="w-3.5 h-3.5 inline animate-pulse" />
        </div>
      </div>
    </div>
  );
};
