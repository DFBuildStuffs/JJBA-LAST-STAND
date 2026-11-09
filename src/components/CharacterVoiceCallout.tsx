import React, { useEffect, useState } from 'react';
import { CharacterVoiceLine } from '../data/characterVoiceLines';
import { Sparkles } from 'lucide-react';

interface CharacterVoiceCalloutProps {
  activeLine: CharacterVoiceLine | null;
  characterName: string;
  characterBadge: string;
  characterHexColor: string;
  onClose?: () => void;
}

export const CharacterVoiceCallout: React.FC<CharacterVoiceCalloutProps> = ({
  activeLine,
  characterName,
  characterBadge,
  characterHexColor,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!activeLine) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, [activeLine, onClose]);

  if (!visible || !activeLine) return null;

  return (
    <div 
      onClick={() => {
        setVisible(false);
        if (onClose) onClose();
      }}
      className="fixed top-16 sm:top-20 right-2 sm:right-4 md:right-6 z-50 pointer-events-auto select-none cursor-pointer touch-manipulation animate-in fade-in slide-in-from-right-4 duration-300 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-1rem)]"
      title="Tap to dismiss"
    >
      {/* Comic Dialogue Frame */}
      <div
        className="relative bg-slate-950/95 text-white p-2.5 sm:p-3 md:p-3.5 rounded-2xl border-2 sm:border-3 border-yellow-400 shadow-[4px_4px_0px_rgba(0,0,0,0.9)] backdrop-blur-md -rotate-1 hover:rotate-0 transition-transform overflow-hidden"
        style={{
          boxShadow: `4px 4px 0px #000, 8px 8px 0px ${activeLine.accentColor}bb`,
        }}
      >
        {/* Halftone / Comic Speedline Texture */}
        <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

        {/* Top Header Badge & Manga Subtitle Tag */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white shadow shrink-0 font-bold"
              style={{ backgroundColor: characterHexColor }}
            >
              {characterBadge}
            </div>
            <div className="flex flex-col">
              <span className="font-bangers text-sm md:text-base text-yellow-300 tracking-wide leading-none">
                {characterName}
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                {activeLine.subtitleCategory}
              </span>
            </div>
          </div>

          {/* Manga Dialogue Tag */}
          <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/50">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-[9px] font-mono font-bold tracking-wider text-yellow-300 uppercase">
              STAND CRY
            </span>
          </div>
        </div>

        {/* Japanese Manga Kanji Callout */}
        <div className="relative z-10 mb-1">
          <span className="font-bangers text-lg md:text-xl text-yellow-400 italic tracking-wide block leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {activeLine.kanji}
          </span>
          <span className="text-[11px] font-mono text-purple-300 tracking-tight block italic">
            "{activeLine.japaneseRomaji}"
          </span>
        </div>

        {/* English Dialogue Line */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-2 relative z-10 mt-1.5">
          <p className="text-xs md:text-sm font-semibold text-slate-100 leading-snug">
            "{activeLine.dialogue}"
          </p>
        </div>

        {/* Floating Menacing Kanji */}
        <div className="absolute -bottom-2 -left-2 text-2xl font-bangers text-purple-500 opacity-60 pointer-events-none animate-menacing">
          ゴゴ
        </div>
      </div>
    </div>
  );
};
