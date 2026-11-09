import React, { useEffect, useState } from 'react';
import { Character } from '../types/game';

interface MoveStickerProps {
  sticker: {
    id: string;
    character: Character;
    slogan: string;
    soundType: string;
  } | null;
}

export const MoveSticker: React.FC<MoveStickerProps> = ({ sticker }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sticker) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, [sticker]);

  if (!visible || !sticker) return null;

  const { character, slogan } = sticker;

  return (
    <div className="fixed top-20 left-4 md:left-6 z-40 pointer-events-none select-none animate-in fade-in zoom-in-75 duration-200 max-w-[calc(100vw-2rem)]">
      {/* Die-Cut Anime Manga Sticker Container */}
      <div
        className="relative bg-white text-slate-950 p-2 md:p-2.5 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.85)] border-3 border-slate-950 -rotate-2 flex items-center gap-2.5 backdrop-blur-md"
        style={{
          boxShadow: `4px 4px 0px #000, 8px 8px 0px ${character.hexColor}99`,
        }}
      >
        {/* Halftone Sticker Texture */}
        <div className="absolute inset-0 halftone-bg opacity-30 rounded-xl pointer-events-none" />

        {/* Character Avatar Stamp */}
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl border-3 border-slate-950 shadow-inner shrink-0"
          style={{ backgroundColor: character.hexColor }}
        >
          {character.badgeSymbol}
        </div>

        {/* Sticker Text & Comic Bubble */}
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5 leading-none mb-0.5">
            <span className="font-bangers text-base md:text-lg text-slate-950 tracking-wider">
              {character.name}
            </span>
            <span
              className="text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full border border-black"
              style={{ backgroundColor: character.hexColor }}
            >
              MOVE!
            </span>
          </div>

          {/* Slogan Speech Bubble */}
          <div className="bg-yellow-300 border-2 border-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_#000] rotate-1">
            <span className="font-bangers text-sm md:text-base tracking-wide text-slate-950 uppercase">
              "{slogan}"
            </span>
          </div>
        </div>

        {/* Corner Menacing Kanji Stamp */}
        <div className="absolute -top-3 -right-2 bg-purple-700 text-yellow-300 font-bangers text-sm px-1.5 rounded-full border-2 border-black shadow">
          ゴ
        </div>
      </div>
    </div>
  );
};
