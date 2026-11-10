import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { StandClashData } from '../types/game';
import { sound } from '../services/audio';
import { Zap, Swords, Trophy, Sparkles } from 'lucide-react';

interface StandClashModalProps {
  clashData: StandClashData | null;
  onResolveClash: (winnerId: number, loserId: number) => void;
}

export const StandClashModal: React.FC<StandClashModalProps> = ({
  clashData,
  onResolveClash,
}) => {
  const [tugValue, setTugValue] = useState(50); // 0 (defender wins) to 100 (attacker wins)
  const [timeLeft, setTimeLeft] = useState(4.0);
  const [tapEffect, setTapEffect] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finisherWinnerId, setFinisherWinnerId] = useState<number | null>(null);

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    particles: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; rotSpeed: THREE.Vector3 }>;
    shockwave: THREE.Mesh;
    animId: number;
  } | null>(null);

  useEffect(() => {
    if (!clashData) {
      setTugValue(50);
      setTimeLeft(4.0);
      setIsFinishing(false);
      setFinisherWinnerId(null);
      return;
    }

    const startTime = Date.now();
    const duration = 4000; // 4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(remaining);

      // AI rhythmic auto-mash (balanced and beatable!)
      if (clashData.defender.isAi || clashData.attacker.isAi) {
        const diff = clashData.difficulty || 'normal';
        const aiStrength =
          diff === 'easy'
            ? Math.random() * 1.4 + 0.8
            : diff === 'hard'
            ? Math.random() * 2.8 + 1.8
            : Math.random() * 2.0 + 1.2;

        const aiMultiplier = diff === 'easy' ? 0.22 : diff === 'hard' ? 0.38 : 0.28;

        setTugValue((prev) => {
          if (clashData.defender.isAi && !clashData.attacker.isAi) {
            return Math.max(5, prev - aiStrength * aiMultiplier);
          }
          if (clashData.attacker.isAi && !clashData.defender.isAi) {
            return Math.min(95, prev + aiStrength * aiMultiplier);
          }
          return prev;
        });
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        // Trigger Dramatic Finisher Sequence!
        handleClashEnd();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [clashData]);

  // Finisher Sequence with 3D Particles, Screen Shake, and Audio
  const handleClashEnd = () => {
    if (!clashData || isFinishing) return;
    setIsFinishing(true);

    const attackerWins = tugValue >= 50;
    const winner = attackerWins ? clashData.attacker : clashData.defender;
    const loser = attackerWins ? clashData.defender : clashData.attacker;
    setFinisherWinnerId(winner.id);

    // Audio Impact
    sound.playClashFinisher();
    sound.playStandCry();

    // Spawn 3D Three.js Particle Blast (Clean, no annoying confetti)
    init3DParticleBurst(winner.character.hexColor);

    // After 1.4s of visual feedback, resolve clash in game state
    setTimeout(() => {
      if (threeSceneRef.current) {
        cancelAnimationFrame(threeSceneRef.current.animId);
        threeSceneRef.current.renderer.dispose();
        threeSceneRef.current = null;
      }
      onResolveClash(winner.id, loser.id);
    }, 1500);
  };

  // Three.js 3D Particle & Shockwave Overlay
  const init3DParticleBurst = (winnerHex: string) => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    // Center Ambient & Point Light
    const light = new THREE.PointLight(0xffffff, 3.5, 50);
    scene.add(light);

    // Expanding 3D Shockwave Ring
    const shockGeo = new THREE.TorusGeometry(1, 0.15, 16, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(winnerHex),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    scene.add(shockwave);

    // 120 3D Shards & Hamon Sparks
    const particles: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; rotSpeed: THREE.Vector3 }> = [];
    const shardGeos = [
      new THREE.TetrahedronGeometry(0.35),
      new THREE.OctahedronGeometry(0.4),
      new THREE.BoxGeometry(0.3, 0.3, 0.3),
    ];

    const sparkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(winnerHex),
      emissive: new THREE.Color(winnerHex),
      emissiveIntensity: 2.0,
      roughness: 0.2,
      metalness: 0.8,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xca8a04,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.9,
    });

    for (let i = 0; i < 90; i++) {
      const geo = shardGeos[i % shardGeos.length];
      const mat = i % 3 === 0 ? goldMat : sparkMat;
      const mesh = new THREE.Mesh(geo, mat);

      // Radial explosive velocity in 3D
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 14 + 6;

      const vel = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi) * speed,
        Math.sin(phi) * speed,
        Math.sin(theta) * Math.cos(phi) * speed
      );

      mesh.position.set(0, 0, 0);
      scene.add(mesh);

      particles.push({
        mesh,
        vel,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ),
      });
    }

    let lastTime = performance.now();
    let shockRadius = 1;

    const renderLoop = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Expand & Fade Shockwave
      shockRadius += dt * 18;
      shockwave.scale.set(shockRadius, shockRadius, shockRadius);
      shockMat.opacity = Math.max(0, 1 - shockRadius / 14);

      // Update 3D Particles
      particles.forEach((p) => {
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += p.rotSpeed.x * dt;
        p.mesh.rotation.y += p.rotSpeed.y * dt;
        p.mesh.rotation.z += p.rotSpeed.z * dt;

        // Decelerate & gentle gravity
        p.vel.multiplyScalar(0.96);
        p.vel.y -= dt * 4;
        p.mesh.scale.multiplyScalar(0.985);
      });

      renderer.render(scene, camera);
      const animId = requestAnimationFrame(renderLoop);
      if (threeSceneRef.current) {
        threeSceneRef.current.animId = animId;
      }
    };

    const animId = requestAnimationFrame(renderLoop);
    threeSceneRef.current = { renderer, scene, camera, particles, shockwave, animId };
  };

  if (!clashData) return null;

  const { attacker, defender } = clashData;
  const isHumanTurn = !attacker.isAi || !defender.isAi;
  const winnerPlayer = finisherWinnerId === attacker.id ? attacker : defender;

  const handlePlayerMash = () => {
    if (isFinishing) return;
    sound.playClashHit();
    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 70);

    setTugValue((prev) => {
      if (!attacker.isAi) {
        return Math.min(95, prev + 7.5);
      } else {
        return Math.max(5, prev - 7.5);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none overflow-hidden">
      {/* Anime Speedlines Backdrop */}
      <div className="absolute inset-0 comic-lines opacity-60 pointer-events-none" />

      {/* 3D Particle Overlay Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
      />

      {/* Shockwave Rings on Finisher */}
      {isFinishing && (
        <>
          <div className="absolute top-1/2 left-1/2 rounded-full border-yellow-400 animate-shockwave pointer-events-none z-30" />
          <div
            className="absolute top-1/2 left-1/2 rounded-full border-red-500 animate-shockwave pointer-events-none z-30"
            style={{ animationDelay: '0.15s' }}
          />
        </>
      )}

      {/* Floating Menacing Kanji */}
      <div className="absolute top-10 left-10 text-6xl font-bangers text-purple-400 animate-menacing">
        ゴゴゴ
      </div>
      <div className="absolute bottom-10 right-10 text-7xl font-bangers text-yellow-400 animate-menacing">
        ゴゴゴ
      </div>

      {/* Main Clash Dialog Container with Screen Shake on Finisher */}
      <div
        className={`relative max-w-lg w-full bg-slate-950 border-3 sm:border-4 rounded-2xl p-4 sm:p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto overscroll-contain ${
          isFinishing
            ? 'animate-screen-shake border-yellow-400 jojo-card-glow'
            : 'border-yellow-400 jojo-box-gold'
        }`}
      >
        {/* Finisher Victory Banner Overlay */}
        {isFinishing && winnerPlayer && (
          <div className="absolute inset-x-0 -top-8 z-50 flex flex-col items-center animate-bounce pointer-events-none">
            <div
              className="px-6 py-2 rounded-full border-4 border-white shadow-2xl flex items-center gap-2"
              style={{ backgroundColor: winnerPlayer.character.hexColor }}
            >
              <Trophy className="w-5 h-5 text-yellow-300 fill-current" />
              <span className="font-black font-bangers text-2xl md:text-3xl text-white tracking-widest uppercase">
                {winnerPlayer.name} OVERPOWERS!
              </span>
            </div>
            <span className="font-bangers text-xl text-yellow-400 mt-1 jojo-text-shadow">
              "{winnerPlayer.character.standCry}"
            </span>
          </div>
        )}

        {/* Clash Title Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-slate-950 font-black font-bangers text-xl md:text-2xl px-6 py-1 rounded-full uppercase tracking-wider border-2 border-white shadow-lg flex items-center gap-2">
            <Swords className="w-5 h-5" />
            STAND CLASH DUEL!
          </div>
        </div>

        {/* Rival User Avatars Face-Off */}
        <div className="w-full flex items-center justify-between gap-4 mb-4">
          {/* Attacker */}
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-xl mb-1 transform transition-all duration-150"
              style={{
                backgroundColor: attacker.character.hexColor,
                transform: tugValue > 50 ? 'scale(1.15) rotate(4deg)' : 'scale(0.95)',
                filter: tugValue > 50 ? 'drop-shadow(0 0 10px gold)' : undefined,
              }}
            >
              {attacker.character.badgeSymbol}
            </div>
            <span className="font-bangers text-lg text-white block leading-tight">
              {attacker.name}
            </span>
            <span className="text-[11px] font-bold text-yellow-400 uppercase">
              {attacker.character.stand}
            </span>
          </div>

          {/* VS Center Marker & Countdown */}
          <div className="flex flex-col items-center">
            <span className="font-bangers text-4xl md:text-5xl text-yellow-400 jojo-text-shadow leading-none">
              VS
            </span>
            <div className="text-sm font-mono font-bold text-red-400 mt-1">
              {isFinishing ? 'FINISHER!' : `${timeLeft.toFixed(1)}s`}
            </div>
          </div>

          {/* Defender */}
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-xl mb-1 transform transition-all duration-150"
              style={{
                backgroundColor: defender.character.hexColor,
                transform: tugValue < 50 ? 'scale(1.15) rotate(-4deg)' : 'scale(0.95)',
                filter: tugValue < 50 ? 'drop-shadow(0 0 10px gold)' : undefined,
              }}
            >
              {defender.character.badgeSymbol}
            </div>
            <span className="font-bangers text-lg text-white block leading-tight">
              {defender.name}
            </span>
            <span className="text-[11px] font-bold text-yellow-400 uppercase">
              {defender.character.stand}
            </span>
          </div>
        </div>

        {/* Dynamic Clash Tug-Of-War Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs font-bold font-mono text-slate-300 mb-1 px-1">
            <span>{attacker.character.standCry}</span>
            <span>{defender.character.standCry}</span>
          </div>
          <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-white relative shadow-inner">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-yellow-400 z-10 opacity-70" />
            <div
              className="h-full bg-gradient-to-r from-red-600 via-yellow-400 to-purple-600 transition-all duration-75"
              style={{ width: `${tugValue}%` }}
            />
          </div>
        </div>

        {/* Rapid Mash Action Button */}
        <button
          onClick={handlePlayerMash}
          disabled={isFinishing}
          className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl font-black font-bangers text-xl sm:text-2xl md:text-3xl tracking-widest uppercase border-3 sm:border-4 border-white shadow-2xl transition-all active:scale-95 cursor-pointer touch-manipulation select-none ${
            isFinishing
              ? 'bg-yellow-400 text-slate-950 scale-102 shadow-yellow-500/50'
              : tapEffect
              ? 'bg-yellow-400 text-slate-950 scale-105'
              : 'bg-gradient-to-r from-red-600 via-pink-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white'
          }`}
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2 -mt-1 fill-current" />
          {isFinishing ? 'CRITICAL FINISHER!' : 'MASH CLASH BARRAGE!'}
        </button>

        <p className="text-xs text-slate-400 mt-2 font-mono">
          {isFinishing
            ? 'OVERPOWERED! Knocking rival backward 3 tiles and siphoning Stand Energy!'
            : 'Tap rapidly to overpower your rival! Loser knocked back 3 tiles.'}
        </p>
      </div>
    </div>
  );
};
