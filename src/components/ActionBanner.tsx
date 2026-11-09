import React from 'react';
import { ActionBannerData } from '../types/game';

interface ActionBannerProps {
  banner: ActionBannerData | null;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({ banner }) => {
  if (!banner) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {/* Anime Speedlines Backdrop */}
      <div className="absolute inset-0 bg-black/60 comic-lines opacity-80" />

      {/* Floating Menacing Japanese Characters */}
      <div className="absolute top-1/4 left-8 text-5xl font-bangers text-purple-400 opacity-80 animate-menacing">
        ゴゴゴ
      </div>
      <div
        className="absolute bottom-1/4 right-8 text-6xl font-bangers text-yellow-400 opacity-80 animate-menacing"
        style={{ animationDelay: '0.8s' }}
      >
        ゴゴゴ
      </div>

      {/* Center Dynamic Comic Splash */}
      <div className="relative animate-jojo-banner flex flex-col items-center text-center px-4 py-3 max-w-[92vw] md:max-w-xl mx-auto">
        <div
          className="text-xs md:text-sm font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-2 border-2 border-white shadow-lg truncate max-w-full"
          style={{ backgroundColor: banner.colorHex }}
        >
          {banner.characterName} — {banner.title}
        </div>

        {/* Big JoJo Battle Cry */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-black font-bangers tracking-wider jojo-text-shadow uppercase leading-none py-1.5 break-words max-w-full"
          style={{ color: banner.colorHex }}
        >
          {banner.cry}
        </h1>

        {/* Subtitle / Effect Detail */}
        <p className="text-base sm:text-lg md:text-xl font-bold text-yellow-300 drop-shadow-md mt-1.5 max-w-md">
          {banner.subtitle}
        </p>
      </div>
    </div>
  );
};
