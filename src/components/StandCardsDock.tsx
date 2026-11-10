import React, { useState, useEffect, useRef } from 'react';
import { Player, StandAbility } from '../types/game';
import { Zap, Shield, Swords, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface StandCardsDockProps {
  player: Player;
  isCurrentPlayerTurn: boolean;
  isTurnBusy: boolean;
  onUseAbility: (ability: StandAbility) => void;
}

export const StandCardsDock: React.FC<StandCardsDockProps> = ({
  player,
  isCurrentPlayerTurn,
  isTurnBusy,
  onUseAbility,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default to keep 3D view clean!
  const [spPulse, setSpPulse] = useState<'gain' | 'loss' | null>(null);
  const [spDelta, setSpDelta] = useState<number | null>(null);

  const prevPlayerIdRef = useRef<number>(player.id);
  const prevSpRef = useRef<number>(player.sp);

  useEffect(() => {
    if (prevPlayerIdRef.current !== player.id) {
      prevPlayerIdRef.current = player.id;
      prevSpRef.current = player.sp;
      setSpPulse(null);
      setSpDelta(null);
      return;
    }

    if (player.sp !== prevSpRef.current) {
      const diff = player.sp - prevSpRef.current;
      setSpDelta(diff);
      setSpPulse(diff > 0 ? 'gain' : 'loss');
      prevSpRef.current = player.sp;

      const t = setTimeout(() => {
        setSpPulse(null);
        setSpDelta(null);
      }, 850);
      return () => clearTimeout(t);
    }
  }, [player.id, player.sp]);

  const character = player.character;

  const getCategoryMeta = (type: string) => {
    switch (type) {
      case 'attack':
        return {
          label: 'OFFENSE',
          color: 'bg-red-500/20 text-red-300 border-red-500/50',
          icon: <Swords className="w-3 h-3 text-red-400" />,
        };
      case 'movement':
        return {
          label: 'MOBILITY',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          icon: <Zap className="w-3 h-3 text-amber-400" />,
        };
      case 'buff':
        return {
          label: 'DEFENSE',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
          icon: <Shield className="w-3 h-3 text-sky-400" />,
        };
      default:
        return {
          label: 'UTILITY',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          icon: <Sparkles className="w-3 h-3 text-purple-400" />,
        };
    }
  };

  const readyAbilitiesCount = character.abilities.filter((ab) => {
    const cd = player.abilityCooldowns[ab.id] || 0;
    return cd === 0 && player.sp >= ab.spCost;
  }).length;

  return (
    <>
      {/* Mobile Backdrop when Deck is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex flex-col-reverse items-start select-none w-auto sm:w-full max-w-md pb-safe">
        {/* Floating Dock Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group bg-slate-950/95 hover:bg-slate-900 border-2 border-purple-500 hover:border-yellow-400 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-1.5 sm:gap-2.5 transition-all cursor-pointer backdrop-blur-md active:scale-95"
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-sm sm:text-base leading-none">{character.badgeSymbol}</span>
            <span className="text-[11px] sm:text-xs font-bangers tracking-wider text-yellow-400 uppercase hidden xs:inline sm:inline">
              {character.stand}
            </span>
          </div>

          {/* Categorized SP Mini Bar with subtle reactive pulse */}
          <div
            className={`relative flex items-center gap-1 sm:gap-1.5 transition-all duration-300 ${
              spPulse === 'gain'
                ? 'animate-pulse-gain'
                : spPulse === 'loss'
                ? 'animate-pulse-loss'
                : ''
            }`}
          >
            <div
              className={`w-10 xs:w-14 sm:w-20 md:w-24 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden border transition-all duration-300 ${
                spPulse === 'gain'
                  ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                  : spPulse === 'loss'
                  ? 'border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]'
                  : 'border-slate-700'
              }`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  spPulse === 'gain'
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-300 brightness-125'
                    : spPulse === 'loss'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 brightness-110'
                    : 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400'
                }`}
                style={{ width: `${(player.sp / player.maxSp) * 100}%` }}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] font-mono font-bold transition-colors duration-300 ${
                spPulse === 'gain'
                  ? 'text-yellow-200 font-black'
                  : spPulse === 'loss'
                  ? 'text-purple-300 font-black'
                  : 'text-yellow-300'
              }`}
            >
              {player.sp} SP
            </span>

            {/* Floating delta indicator (+20 or -15) */}
            {spDelta !== null && (
              <span
                key={`dock-sp-delta-${spDelta}-${player.sp}`}
                className={`absolute -top-3.5 left-2 sm:left-4 text-[9px] sm:text-[10px] font-mono font-black pointer-events-none animate-delta-float z-30 px-1.5 py-0.2 rounded-full shadow ${
                  spDelta > 0
                    ? 'text-yellow-300 bg-yellow-950/90 border border-yellow-500/80'
                    : 'text-purple-300 bg-purple-950/90 border border-purple-500/80'
                }`}
              >
                {spDelta > 0 ? `+${spDelta}` : spDelta}
              </span>
            )}
          </div>

          {/* Ready Badge */}
          <span
            className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${
              readyAbilitiesCount > 0
                ? 'bg-green-950/80 text-green-300 border-green-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            {readyAbilitiesCount} Ready
          </span>

          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-yellow-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-yellow-400" />
          )}
        </button>

        {/* Expanded Categorized Deck (Bottom Sheet on Mobile, inline card on Desktop) */}
        {isOpen && (
          <div className="fixed inset-x-2 bottom-18 sm:static sm:inset-auto sm:mb-2 z-50 w-[calc(100vw-1rem)] sm:w-full max-w-md bg-slate-950/98 border-2 border-purple-500/90 rounded-2xl p-3 shadow-2xl jojo-box-shadow backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {character.stand} Deck
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-purple-400 font-mono italic hidden sm:inline">
                  "{character.standCry}"
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer sm:hidden bg-slate-800"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* 3 Ability Cards Grid categorized cleanly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
              {character.abilities.map((ability) => {
                const category = getCategoryMeta(ability.type);
                const cooldown = player.abilityCooldowns[ability.id] || 0;
                const hasEnoughSp = player.sp >= ability.spCost;
                const canActivate =
                  isCurrentPlayerTurn && !player.isAi && !isTurnBusy && hasEnoughSp && cooldown === 0;

                return (
                  <div
                    key={ability.id}
                    className={`flex flex-col justify-between p-2.5 rounded-lg border transition-all ${
                      canActivate
                        ? 'bg-slate-900/90 hover:bg-slate-850 border-purple-400 hover:border-yellow-400 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Header: Category Badge + SP Cost */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`flex items-center gap-1 text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded border uppercase tracking-wider ${category.color}`}
                        >
                          {category.icon}
                          {category.label}
                        </span>
                        <span className="bg-slate-950 border border-yellow-500/60 text-yellow-400 font-mono text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                          {ability.spCost} SP
                        </span>
                      </div>

                      {/* Card Title */}
                      <h4 className="font-bangers text-base text-white tracking-wide leading-tight mb-1">
                        {ability.name}
                      </h4>

                      {/* Concise Categorized Effect */}
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {ability.description}
                      </p>
                    </div>

                    {/* Activation Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-purple-300 font-mono truncate max-w-[120px]">
                        {ability.voiceLine}
                      </span>

                      <button
                        onClick={() => {
                          onUseAbility(ability);
                          // Auto close on mobile so board is visible
                          if (window.innerWidth < 640) {
                            setIsOpen(false);
                          }
                        }}
                        disabled={!canActivate}
                        className={`text-xs font-bold px-3 py-1.5 sm:py-1 rounded transition-all cursor-pointer ${
                          canActivate
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {cooldown > 0
                          ? `CD: ${cooldown}t`
                          : !hasEnoughSp
                          ? 'Low SP'
                          : 'ACTIVATE'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
