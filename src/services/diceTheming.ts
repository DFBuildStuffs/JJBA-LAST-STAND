import * as THREE from 'three';

export interface CharacterDiceTheme {
  id: string;
  name: string;
  standName: string;
  badgeSymbol: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderColor: string;
  pipColor: string;
  auraColor: string;
  metalness: number;
  roughness: number;
  hudGlow: string;
  drawFace: (ctx: CanvasRenderingContext2D, face: number, size: number) => void;
}

// Helper to draw standard pips with custom styling
function drawStandardPips(
  ctx: CanvasRenderingContext2D,
  face: number,
  size: number,
  drawPipShape: (px: number, py: number, r: number) => void,
  pipRadius = 18
) {
  const p1 = size * 0.28;
  const pMid = size * 0.5;
  const p2 = size * 0.72;

  if (face === 1) {
    drawPipShape(pMid, pMid, pipRadius * 1.5);
  } else if (face === 2) {
    drawPipShape(p1, p1, pipRadius);
    drawPipShape(p2, p2, pipRadius);
  } else if (face === 3) {
    drawPipShape(p1, p1, pipRadius);
    drawPipShape(pMid, pMid, pipRadius);
    drawPipShape(p2, p2, pipRadius);
  } else if (face === 4) {
    drawPipShape(p1, p1, pipRadius);
    drawPipShape(p2, p1, pipRadius);
    drawPipShape(p1, p2, pipRadius);
    drawPipShape(p2, p2, pipRadius);
  } else if (face === 5) {
    drawPipShape(p1, p1, pipRadius);
    drawPipShape(p2, p1, pipRadius);
    drawPipShape(pMid, pMid, pipRadius);
    drawPipShape(p1, p2, pipRadius);
    drawPipShape(p2, p2, pipRadius);
  } else if (face === 6) {
    const y1 = size * 0.24;
    const y2 = size * 0.50;
    const y3 = size * 0.76;
    drawPipShape(p1, y1, pipRadius * 0.95);
    drawPipShape(p1, y2, pipRadius * 0.95);
    drawPipShape(p1, y3, pipRadius * 0.95);
    drawPipShape(p2, y1, pipRadius * 0.95);
    drawPipShape(p2, y2, pipRadius * 0.95);
    drawPipShape(p2, y3, pipRadius * 0.95);
  }
}

// Helper to draw a 5-pointed star
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes = 5, outerRadius = 25, innerRadius = 12) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

// Helper to draw a heart shape
function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(cx, cy + size * 0.35);
  ctx.bezierCurveTo(
    cx - size * 0.6, cy - size * 0.2,
    cx - size * 0.6, cy - size * 0.6,
    cx, cy - size * 0.3
  );
  ctx.bezierCurveTo(
    cx + size * 0.6, cy - size * 0.6,
    cx + size * 0.6, cy - size * 0.2,
    cx, cy + size * 0.35
  );
  ctx.closePath();
}

export const CHARACTER_DICE_THEMES: Record<string, CharacterDiceTheme> = {
  // 1. JOTARO KUJO - Star Platinum Die
  jotaro: {
    id: 'jotaro',
    name: 'Star Platinum Die',
    standName: 'Star Platinum',
    badgeSymbol: '⭐',
    tagline: 'ORA ORA CRITICAL!',
    primaryColor: '#0f172a',
    secondaryColor: '#312e81',
    accentColor: '#facc15',
    borderColor: '#eab308',
    pipColor: '#fef08a',
    auraColor: '#818cf8',
    metalness: 0.85,
    roughness: 0.2,
    hudGlow: 'rgba(234, 179, 8, 0.45)',
    drawFace: (ctx, face, size) => {
      // Cosmic Midnight Blue gradient background
      const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.7);
      grad.addColorStop(0, '#2e1065');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Gold metallic border with corner accents
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 10;
      ctx.strokeRect(6, 6, size - 12, size - 12);

      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      // Subtle star constellation background lines
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 20); ctx.lineTo(size - 20, size - 20);
      ctx.moveTo(size - 20, 20); ctx.lineTo(20, size - 20);
      ctx.stroke();

      if (face === 1) {
        // Face 1: Joestar Star Emblem with golden rays & "ORA!"
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#facc15';
        drawStar(ctx, size / 2, size / 2 - 10, 5, 48, 22);
        ctx.fill();

        ctx.fillStyle = '#dc2626';
        drawStar(ctx, size / 2, size / 2 - 10, 5, 24, 11);
        ctx.fill();
        ctx.restore();

        // ORA! text callout
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ORA!', size / 2, size - 28);
      } else {
        // Faces 2-6: Golden Star Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#facc15';
          drawStar(ctx, px, py, 5, r * 1.05, r * 0.48);
          ctx.fill();

          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 2. DIO - Stone Mask & The World Die
  dio: {
    id: 'dio',
    name: 'Stone Mask Die',
    standName: 'The World',
    badgeSymbol: '🗿',
    tagline: 'ZA WARUDO! WRYYY!',
    primaryColor: '#1c1917',
    secondaryColor: '#450a0a',
    accentColor: '#e11d48',
    borderColor: '#991b1b',
    pipColor: '#f43f5e',
    auraColor: '#eab308',
    metalness: 0.65,
    roughness: 0.35,
    hudGlow: 'rgba(225, 29, 72, 0.45)',
    drawFace: (ctx, face, size) => {
      // Weathered stone slab with ancient blood texture
      const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size * 0.7);
      grad.addColorStop(0, '#292524');
      grad.addColorStop(0.7, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Cracked stone & dried crimson veins
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 60); ctx.lineTo(70, 95); ctx.lineTo(120, 80); ctx.lineTo(200, 140);
      ctx.moveTo(160, 20); ctx.lineTo(190, 80); ctx.lineTo(240, 90);
      ctx.stroke();

      // Ancient stone carved border
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Aztec Stone Mask with glowing golden vampire eyes & "WRYYY"
        ctx.save();
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 20;

        // Mask Face Silhouette
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.roundRect(size / 2 - 36, size / 2 - 50, 72, 85, [18, 18, 28, 28]);
        ctx.fill();

        // Cheek cheekbone carvings
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.arc(size / 2 - 18, size / 2 - 12, 12, 0, Math.PI * 2);
        ctx.arc(size / 2 + 18, size / 2 - 12, 12, 0, Math.PI * 2);
        ctx.fill();

        // Piercing Golden Vampire Eyes
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(size / 2 - 16, size / 2 - 20, 8, 4, 0.2, 0, Math.PI * 2);
        ctx.ellipse(size / 2 + 16, size / 2 - 20, 8, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Vampire Fangs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(size / 2 - 12, size / 2 + 10); ctx.lineTo(size / 2 - 8, size / 2 + 22); ctx.lineTo(size / 2 - 4, size / 2 + 10);
        ctx.moveTo(size / 2 + 4, size / 2 + 10); ctx.lineTo(size / 2 + 8, size / 2 + 22); ctx.lineTo(size / 2 + 12, size / 2 + 10);
        ctx.fill();
        ctx.restore();

        // WRYYY text
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 24px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WRYYYY!', size / 2, size - 24);
      } else {
        // Faces 2-6: Blood Ruby Gem Pips with inner gold glow
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(px, py, r * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(px - r * 0.25, py - r * 0.25, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 3. GIORNO GIOVANNA - Gold Experience Die
  giorno: {
    id: 'giorno',
    name: 'Gold Experience Die',
    standName: 'Gold Experience',
    badgeSymbol: '🐞',
    tagline: 'MUDA MUDA REQUIEM!',
    primaryColor: '#713f12',
    secondaryColor: '#ca8a04',
    accentColor: '#ec4899',
    borderColor: '#eab308',
    pipColor: '#f472b6',
    auraColor: '#facc15',
    metalness: 0.95,
    roughness: 0.15,
    hudGlow: 'rgba(234, 179, 8, 0.5)',
    drawFace: (ctx, face, size) => {
      // Lustrous Imperial Gold leaf finish
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.3, '#eab308');
      grad.addColorStop(0.7, '#ca8a04');
      grad.addColorStop(1, '#854d0e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Delicate organic vine tracery
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(30, 30, 20, 0, Math.PI * 0.8);
      ctx.arc(size - 30, size - 30, 20, Math.PI, Math.PI * 1.8);
      ctx.stroke();

      // Polished gold and pink gem border
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Gold Experience Ladybug Brooch 🐞 & "MUDA!"
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 18;

        // Ladybug Wings (Hot Pink/Cyan dual-tone)
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.ellipse(size / 2, size / 2 - 12, 34, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center split line
        ctx.strokeStyle = '#831843';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2 - 52); ctx.lineTo(size / 2, size / 2 + 28);
        ctx.stroke();

        // Spots on Ladybug wings
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(size / 2 - 16, size / 2 - 20, 6, 0, Math.PI * 2);
        ctx.arc(size / 2 + 16, size / 2 - 20, 6, 0, Math.PI * 2);
        ctx.arc(size / 2 - 16, size / 2 + 6, 6, 0, Math.PI * 2);
        ctx.arc(size / 2 + 16, size / 2 + 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // Golden Head & Antennae
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2 - 50, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // MUDA! text
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 24px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MUDA!', size / 2, size - 24);
      } else {
        // Faces 2-6: Hot Pink Jeweled Ladybug Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(px, py, r * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 4. JOSUKE HIGASHIKATA - Crazy Diamond Die
  josuke: {
    id: 'josuke',
    name: 'Crazy Diamond Die',
    standName: 'Crazy Diamond',
    badgeSymbol: '💎',
    tagline: 'DORARARA RESTORATION!',
    primaryColor: '#1e3a8a',
    secondaryColor: '#0284c7',
    accentColor: '#f472b6',
    borderColor: '#38bdf8',
    pipColor: '#f472b6',
    auraColor: '#00f0ff',
    metalness: 0.75,
    roughness: 0.18,
    hudGlow: 'rgba(56, 189, 248, 0.45)',
    drawFace: (ctx, face, size) => {
      // Crystalline Blue Diamond sheen
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Faceted diamond reflective lattice lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(size / 2, 10); ctx.lineTo(size - 10, size / 2); ctx.lineTo(size / 2, size - 10); ctx.lineTo(10, size / 2); ctx.closePath();
      ctx.stroke();

      // Chrome and pink neon border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Crazy Diamond Peace Heart 💖 & "DORA!"
        ctx.save();
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#f472b6';
        drawHeart(ctx, size / 2, size / 2 - 12, 60);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        drawHeart(ctx, size / 2, size / 2 - 12, 30);
        ctx.fill();
        ctx.restore();

        // DORA! text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DORARARA!', size / 2, size - 24);
      } else {
        // Faces 2-6: Glowing Heart / Diamond Facet Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#f472b6';
          drawHeart(ctx, px, py - r * 0.1, r * 1.5);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 5. JOSEPH JOESTAR - Hermit Purple & Hamon Die
  joseph: {
    id: 'joseph',
    name: 'Hermit Purple Die',
    standName: 'Hermit Purple',
    badgeSymbol: '📷',
    tagline: 'YOUR NEXT LINE IS...!',
    primaryColor: '#3b0764',
    secondaryColor: '#6b21a8',
    accentColor: '#facc15',
    borderColor: '#a855f7',
    pipColor: '#fde047',
    auraColor: '#a855f7',
    metalness: 0.7,
    roughness: 0.25,
    hudGlow: 'rgba(168, 85, 247, 0.45)',
    drawFace: (ctx, face, size) => {
      // Mystic Deep Amethyst gradient
      const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.7);
      grad.addColorStop(0, '#581c87');
      grad.addColorStop(0.7, '#3b0764');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Thorny purple vine wrap around border
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 18); ctx.bezierCurveTo(60, 10, 100, 30, size - 18, 18);
      ctx.bezierCurveTo(size - 10, 60, size - 30, 120, size - 18, size - 18);
      ctx.bezierCurveTo(120, size - 10, 60, size - 25, 18, size - 18);
      ctx.closePath();
      ctx.stroke();

      // Border with brass corners
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);

      if (face === 1) {
        // Face 1: Clackers & Spirit Divination Lightning ⚡
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 20;

        // Hamon lightning bolt
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(size / 2 - 8, size / 2 - 48);
        ctx.lineTo(size / 2 + 18, size / 2 - 18);
        ctx.lineTo(size / 2 + 2, size / 2 - 16);
        ctx.lineTo(size / 2 + 14, size / 2 + 20);
        ctx.lineTo(size / 2 - 14, size / 2 - 4);
        ctx.lineTo(size / 2 + 2, size / 2 - 6);
        ctx.closePath();
        ctx.fill();

        // Two Clacker Balls
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(size / 2 - 24, size / 2 + 4, 12, 0, Math.PI * 2);
        ctx.arc(size / 2 + 24, size / 2 + 4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // OH MY GOD text
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 22px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OH MY GOD!', size / 2, size - 24);
      } else {
        // Faces 2-6: Golden Hamon Ripple Spark Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          // Outer ripple ring
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, r * 1.35, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.95, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#7e22ce';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 6. JOLYNE CUJOH - Stone Free Die
  jolyne: {
    id: 'jolyne',
    name: 'Stone Free Die',
    standName: 'Stone Free',
    badgeSymbol: '🦋',
    tagline: '1,000 STRIKES!',
    primaryColor: '#14532d',
    secondaryColor: '#15803d',
    accentColor: '#06b6d4',
    borderColor: '#22c55e',
    pipColor: '#67e8f9',
    auraColor: '#4ade80',
    metalness: 0.65,
    roughness: 0.3,
    hudGlow: 'rgba(34, 197, 94, 0.45)',
    drawFace: (ctx, face, size) => {
      // Emerald Green & Cyan Thread Texture
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#166534');
      grad.addColorStop(1, '#0f766e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Spider-web string lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
      ctx.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
      ctx.arc(size / 2, size / 2, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Neon lime and cyan border
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Stone Free Butterfly 🦋 & "ORA!"
        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 20;

        // Butterfly Wings (Cyan & Lime)
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        // Top Left Wing
        ctx.ellipse(size / 2 - 20, size / 2 - 22, 22, 14, -0.4, 0, Math.PI * 2);
        // Top Right Wing
        ctx.ellipse(size / 2 + 20, size / 2 - 22, 22, 14, 0.4, 0, Math.PI * 2);
        // Bottom Left Wing
        ctx.ellipse(size / 2 - 14, size / 2 + 2, 16, 11, 0.3, 0, Math.PI * 2);
        // Bottom Right Wing
        ctx.ellipse(size / 2 + 14, size / 2 + 2, 16, 11, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Body & Antennae
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(size / 2, size / 2 - 8, 4, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ORA! text
        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 24px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STONE FREE!', size / 2, size - 24);
      } else {
        // Faces 2-6: Cyan Threaded Target Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(px, py, r * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#14532d';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 7. JOHNNY JOESTAR - Tusk Golden Spin Die
  johnny: {
    id: 'johnny',
    name: 'Tusk Golden Spin Die',
    standName: 'Tusk Act 4',
    badgeSymbol: '🐎',
    tagline: 'INFINITE ROTATION!',
    primaryColor: '#0891b2',
    secondaryColor: '#0e7490',
    accentColor: '#f43f5e',
    borderColor: '#38bdf8',
    pipColor: '#fb7185',
    auraColor: '#38bdf8',
    metalness: 0.8,
    roughness: 0.22,
    hudGlow: 'rgba(6, 182, 212, 0.45)',
    drawFace: (ctx, face, size) => {
      // Sky blue SBR trail gradient
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#06b6d4');
      grad.addColorStop(1, '#0e7490');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Golden Spiral logarithmic curve overlay
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let a = 1.5;
      let b = 0.2;
      for (let theta = 0; theta < Math.PI * 3.5; theta += 0.1) {
        const rad = a * Math.exp(b * theta) * 3;
        const x = size / 2 + Math.cos(theta) * rad;
        const y = size / 2 + Math.sin(theta) * rad;
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Horseshoe brass and steel border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Horseshoe 🐎 & "CHUMIMI~N!"
        ctx.save();
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 20;

        // Steel Horseshoe
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2 - 10, 28, Math.PI * 0.15, Math.PI * 0.85, true);
        ctx.stroke();

        // Horseshoe nail holes
        ctx.fillStyle = '#0891b2';
        ctx.beginPath();
        ctx.arc(size / 2 - 22, size / 2 - 20, 3, 0, Math.PI * 2);
        ctx.arc(size / 2 + 22, size / 2 - 20, 3, 0, Math.PI * 2);
        ctx.arc(size / 2 - 26, size / 2 - 6, 3, 0, Math.PI * 2);
        ctx.arc(size / 2 + 26, size / 2 - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // CHUMIMI~N text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHUMIMI~N!', size / 2, size - 24);
      } else {
        // Faces 2-6: Spinning Nail Bullet Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(px, py, r * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 8. JONATHAN JOESTAR - Sunlight Hamon Die
  jonathan: {
    id: 'jonathan',
    name: 'Sunlight Ripple Die',
    standName: 'Sunlight Hamon',
    badgeSymbol: '☀️',
    tagline: 'SUNLIGHT OVERDRIVE!',
    primaryColor: '#c2410c',
    secondaryColor: '#ea580c',
    accentColor: '#38bdf8',
    borderColor: '#f97316',
    pipColor: '#fef08a',
    auraColor: '#fb923c',
    metalness: 0.8,
    roughness: 0.2,
    hudGlow: 'rgba(249, 115, 22, 0.45)',
    drawFace: (ctx, face, size) => {
      // Solar Flame radiant gradient
      const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size * 0.7);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.3, '#f97316');
      grad.addColorStop(0.8, '#c2410c');
      grad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Concentric Ripple Wave rings
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 35, 0, Math.PI * 2);
      ctx.arc(size / 2, size / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Radiant Gold and Blue chivalry border
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Blazing Sun Crest ☀️ & "OVERDRIVE!"
        ctx.save();
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 24;

        // Radiant Sun Core
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2 - 12, 24, 0, Math.PI * 2);
        ctx.fill();

        // 8 Solar Flares
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = size / 2 + Math.cos(angle) * 30;
          const y1 = size / 2 - 12 + Math.sin(angle) * 30;
          const x2 = size / 2 + Math.cos(angle) * 44;
          const y2 = size / 2 - 12 + Math.sin(angle) * 44;
          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();

        // OVERDRIVE text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OVERDRIVE!', size / 2, size - 24);
      } else {
        // Faces 2-6: Golden Solar Flare Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py, r * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },

  // 9. YOSHIKAGE KIRA - Killer Queen Bomb Die
  kira: {
    id: 'kira',
    name: 'Killer Queen Die',
    standName: 'Killer Queen',
    badgeSymbol: '💣',
    tagline: 'SHEER HEART ATTACK!',
    primaryColor: '#3b0764',
    secondaryColor: '#581c87',
    accentColor: '#ec4899',
    borderColor: '#c084fc',
    pipColor: '#f472b6',
    auraColor: '#ec4899',
    metalness: 0.75,
    roughness: 0.25,
    hudGlow: 'rgba(236, 72, 153, 0.45)',
    drawFace: (ctx, face, size) => {
      // Deep ominous violet-noir background
      const grad = ctx.createRadialGradient(size / 2, size / 2, 15, size / 2, size / 2, size * 0.75);
      grad.addColorStop(0, '#581c87');
      grad.addColorStop(0.6, '#3b0764');
      grad.addColorStop(1, '#18181b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Warning hazard stripes around outer rim
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(14, 14, size - 28, size - 28);

      if (face === 1) {
        // Face 1: Killer Queen Cat-Skull Emblem 💀 & "CLICK!"
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 22;

        // Cat Ears Skull Crest
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        // Skull base
        ctx.arc(size / 2, size / 2 - 8, 30, 0, Math.PI);
        // Cat Ears
        ctx.lineTo(size / 2 - 32, size / 2 - 42);
        ctx.lineTo(size / 2 - 12, size / 2 - 32);
        ctx.lineTo(size / 2 + 12, size / 2 - 32);
        ctx.lineTo(size / 2 + 32, size / 2 - 42);
        ctx.closePath();
        ctx.fill();

        // Crimson Cat Slit Eyes
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(size / 2 - 14, size / 2 - 14, 8, 4, 0.3, 0, Math.PI * 2);
        ctx.ellipse(size / 2 + 14, size / 2 - 14, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(size / 2 - 14, size / 2 - 14, 4, 2, 0.3, 0, Math.PI * 2);
        ctx.ellipse(size / 2 + 14, size / 2 - 14, 4, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // CLICK! Detonation text
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 24px Bangers, Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK!', size / 2, size - 24);
      } else {
        // Faces 2-6: Bomb / Skull Pips
        drawStandardPips(ctx, face, size, (px, py, r) => {
          ctx.save();
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(px, py, r * 1.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#18181b';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    },
  },
};

export function getCharacterDiceTheme(characterId?: string): CharacterDiceTheme {
  if (!characterId) return CHARACTER_DICE_THEMES.jotaro;
  const theme = CHARACTER_DICE_THEMES[characterId.toLowerCase()];
  return theme || CHARACTER_DICE_THEMES.jotaro;
}

// Memory cache for generated dice materials to prevent re-rendering canvases on every turn
const materialsCache = new Map<string, THREE.MeshStandardMaterial[]>();

export function getDiceMaterialsForCharacter(
  characterId: string,
  renderer: THREE.WebGLRenderer
): THREE.MeshStandardMaterial[] {
  const safeId = characterId.toLowerCase();
  const theme = getCharacterDiceTheme(safeId);

  if (materialsCache.has(safeId)) {
    return materialsCache.get(safeId)!;
  }

  const materials: THREE.MeshStandardMaterial[] = [];
  const size = 256; // Crisp high-definition texture resolution

  for (let face = 1; face <= 6; face++) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      theme.drawFace(ctx, face, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: theme.roughness,
      metalness: theme.metalness,
    });
    materials.push(mat);
  }

  materialsCache.set(safeId, materials);
  return materials;
}
