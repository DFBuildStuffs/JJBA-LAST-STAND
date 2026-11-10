import React, { useEffect, useRef } from 'react';
import { Player, StandAbility } from '../types/game';
import { Zap, Sparkles, Swords, Shield } from 'lucide-react';

export interface StandVFXData {
  id: string;
  ability: StandAbility;
  player: Player;
}

interface StandActivationVFXProps {
  vfx: StandVFXData | null;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'star' | 'kanji';
  text?: string;
  rotation: number;
  rotSpeed: number;
}

export const StandActivationVFX: React.FC<StandActivationVFXProps> = ({ vfx, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!vfx) return;

    const char = vfx.player.character;
    const ability = vfx.ability;

    // High-speed Canvas Particle Physics
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const centerX = width / 2;
    const centerY = height / 2;

    const particles: Particle[] = [];
    const kanjiList = ['ゴ', 'ド', 'ズ', 'オラ', '無駄', 'ドラ', '★'];

    // Spawn 70 energy spark and aura particles
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color: i % 3 === 0 ? char.hexColor : i % 3 === 1 ? char.secondaryHex : char.accentHex,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        type: Math.random() > 0.8 ? 'star' : 'spark',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    // Spawn 14 floating menacing comic onomatopoeia particles
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 5 + 3;
      particles.push({
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // slight upward float
        radius: Math.random() * 16 + 18,
        color: i % 2 === 0 ? '#facc15' : '#c084fc',
        alpha: 1,
        decay: Math.random() * 0.01 + 0.008,
        type: 'kanji',
        text: kanjiList[i % kanjiList.length],
        rotation: (Math.random() - 0.5) * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render radial speedlines toward center
      ctx.save();
      ctx.strokeStyle = `${char.accentHex}22`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 32; i++) {
        const rad = (i / 32) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(rad) * 180, centerY + Math.sin(rad) * 180);
        ctx.lineTo(centerX + Math.cos(rad) * width, centerY + Math.sin(rad) * height);
        ctx.stroke();
      }
      ctx.restore();

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // air drag
        p.vy *= 0.96;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === 'spark') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.font = `${p.radius * 2.5}px Oswald, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 0);
        } else if (p.type === 'kanji') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `900 ${p.radius}px Bangers, Oswald, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Black border
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#000000';
          ctx.strokeText(p.text || 'ゴ', 0, 0);

          // Glowing text fill
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.fillText(p.text || 'ゴ', 0, 0);
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    // Auto complete after duration
    const timer = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [vfx, onComplete]);

  if (!vfx) return null;

  const char = vfx.player.character;
  const ability = vfx.ability;

  const getAbilityIcon = (type: string) => {
    switch (type) {
      case 'attack':
        return <Swords className="w-5 h-5 text-red-400" />;
      case 'movement':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'buff':
        return <Shield className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden flex items-center justify-center">
      {/* 1. Iconic Araki Anime Palette Swap / Inversion Flash */}
      <div className="absolute inset-0 bg-purple-950/40 mix-blend-color-dodge animate-stand-palette-swap" />

      {/* 2. Fullscreen Manga Speedlines Radial Background */}
      <div className="absolute inset-0 comic-lines opacity-60 animate-speedlines-burst" />

      {/* 3. Expanding Concentric Stand Aura Rings */}
      <div
        className="absolute w-72 h-72 rounded-full border-4 animate-stand-aura-ring"
        style={{
          borderColor: char.hexColor,
          color: char.hexColor,
          boxShadow: `0 0 40px ${char.hexColor}`,
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full border-3 animate-stand-aura-ring"
        style={{
          borderColor: char.secondaryHex,
          color: char.secondaryHex,
          animationDelay: '0.15s',
          boxShadow: `0 0 50px ${char.secondaryHex}`,
        }}
      />

      {/* 4. Comic Diagonal Light Slash Cut */}
      <div className="absolute w-[180vw] h-4 bg-gradient-to-r from-transparent via-white to-transparent animate-comic-slash blur-[1px] shadow-[0_0_30px_#ffffff]" />

      {/* 5. Particle Physics Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 6. Floating Menacing Kanji Elements (DOM Layer) */}
      <div
        className="absolute top-1/4 left-12 text-6xl md:text-8xl font-bangers text-purple-400 opacity-90 animate-kanji-radiate drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
        style={{ '--tx': '-60px', '--ty': '-50px', '--rot': '-15deg' } as React.CSSProperties}
      >
        ゴゴゴ
      </div>
      <div
        className="absolute bottom-1/4 right-14 text-6xl md:text-8xl font-bangers text-yellow-400 opacity-90 animate-kanji-radiate drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
        style={{
          '--tx': '70px',
          '--ty': '40px',
          '--rot': '18deg',
          animationDelay: '0.1s',
        } as React.CSSProperties}
      >
        ドドド
      </div>
      <div
        className="absolute top-20 right-28 text-5xl md:text-7xl font-bangers text-pink-400 opacity-80 animate-kanji-radiate drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
        style={{
          '--tx': '50px',
          '--ty': '-60px',
          '--rot': '10deg',
          animationDelay: '0.2s',
        } as React.CSSProperties}
      >
        ズキューン
      </div>

      {/* 7. Dramatic Manga Cut-In Banner */}
      <div className="relative z-10 w-full max-w-4xl px-4 animate-manga-cutin">
        <div
          className="relative bg-gradient-to-r from-black via-slate-950 to-black border-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-4 md:p-6 transform -skew-x-12 overflow-hidden"
          style={{ borderColor: char.hexColor }}
        >
          {/* Halftone and Aura Glow Underlay */}
          <div className="absolute inset-0 halftone-bg opacity-30" />
          <div
            className="absolute inset-0 opacity-20 bg-gradient-to-r"
            style={{
              backgroundImage: `linear-gradient(to right, ${char.hexColor}, ${char.secondaryHex}, ${char.accentHex})`,
            }}
          />

          <div className="relative z-10 transform skew-x-12 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Stand User & Stand Name */}
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl border-3 shadow-2xl bg-slate-900 shrink-0"
                style={{ borderColor: char.accentHex }}
              >
                <span>{char.badgeSymbol}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase bg-yellow-400 text-black px-2 py-0.5 rounded shadow">
                    STAND ACTIVATION
                  </span>
                  <span className="text-xs md:text-sm font-bold text-slate-300">
                    {vfx.player.name}
                  </span>
                </div>
                <h3
                  className="font-bangers text-2xl md:text-4xl text-white tracking-wide drop-shadow-[0_3px_0_#000]"
                  style={{ color: char.accentHex }}
                >
                  {char.stand}
                </h3>
              </div>
            </div>

            {/* Center / Right: Ability Name & Iconic Battle Cry */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-yellow-300 bg-slate-900/90 border border-yellow-500/60 px-2.5 py-0.5 rounded-full">
                  {getAbilityIcon(ability.type)}
                  {ability.name}
                </span>
                <span className="font-mono text-xs text-yellow-400 font-bold bg-black/80 px-2 py-0.5 rounded border border-slate-700">
                  -{ability.spCost} SP
                </span>
              </div>

              <h2 className="font-bangers text-3xl md:text-5xl text-yellow-400 tracking-wider jojo-text-shadow leading-none italic">
                "{ability.voiceLine}"
              </h2>
              <p className="text-xs md:text-sm text-slate-300 max-w-md mt-1 truncate">
                {ability.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
