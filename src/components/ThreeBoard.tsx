import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Player, ViewMode } from '../types/game';
import { SPECIAL_CELLS } from '../data/specialCells';
import { getDiceMaterialsForCharacter, getCharacterDiceTheme } from '../services/diceTheming';

interface ThreeBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  viewMode: ViewMode;
  diceRolling: boolean;
  diceValue: number | null;
  isTimeStopped: boolean;
  boardLength?: number;
  onTileClick?: (cellNumber: number) => void;
}

export function getCellCoordinates(cellNum: number): { x: number; z: number; y: number } {
  if (cellNum <= 0) {
    return { x: -14.5, z: 14.5, y: 0 };
  }
  const safeCell = Math.min(100, Math.max(1, cellNum));
  const row = Math.floor((safeCell - 1) / 10);
  const remainder = (safeCell - 1) % 10;
  // Boustrophedon / serpentine row layout
  const col = row % 2 === 0 ? remainder : 9 - remainder;

  // 10x10 grid centered around 0
  const spacing = 3.0;
  const originX = -13.5;
  const originZ = 13.5;

  const x = originX + col * spacing;
  const z = originZ - row * spacing;
  return { x, z, y: 0.35 };
}

export const ThreeBoard: React.FC<ThreeBoardProps> = ({
  players,
  currentPlayerIndex,
  viewMode,
  diceRolling,
  diceValue,
  isTimeStopped,
  boardLength = 100,
  onTileClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pawnsRef = useRef<Map<number, THREE.Group>>(new Map());
  const diceGroupRef = useRef<THREE.Group | null>(null);
  const diceMeshRef = useRef<THREE.Mesh | null>(null);
  const diceAuraRingRef = useRef<THREE.Mesh | null>(null);
  const diceEnergyRingRef = useRef<THREE.Mesh | null>(null);
  const arrowGroupRef = useRef<THREE.Group | null>(null);
  const menacingKanjiRef = useRef<THREE.Group[]>([]);
  const tilesMeshMapRef = useRef<Map<number, THREE.Mesh>>(new Map());
  const hazardBeaconsRef = useRef<Map<number, THREE.Group>>(new Map());
  const isDraggingRef = useRef(false);
  const pointerPosRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ theta: Math.PI * 0.25, phi: Math.PI * 0.32, radius: 46 });
  const tacticalScrollZRef = useRef<number>(0);
  const [tacticalScroll, setTacticalScroll] = React.useState<number>(0);

  const jumpToZ = (z: number) => {
    tacticalScrollZRef.current = z;
    setTacticalScroll(z);
  };

  // Props refs to avoid stale closure in animation loop
  const playersRef = useRef(players);
  playersRef.current = players;
  const currentIdxRef = useRef(currentPlayerIndex);
  currentIdxRef.current = currentPlayerIndex;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const rollingRef = useRef(diceRolling);
  rollingRef.current = diceRolling;
  const diceValRef = useRef(diceValue);
  diceValRef.current = diceValue;
  const timeStoppedRef = useRef(isTimeStopped);
  timeStoppedRef.current = isTimeStopped;

  // Reactively update 3D dice appearance when the active player changes!
  const activeCharId = players[currentPlayerIndex]?.character?.id || 'jotaro';
  useEffect(() => {
    if (diceMeshRef.current && rendererRef.current) {
      const mats = getDiceMaterialsForCharacter(activeCharId, rendererRef.current);
      diceMeshRef.current.material = mats;

      const theme = getCharacterDiceTheme(activeCharId);
      if (diceAuraRingRef.current) {
        (diceAuraRingRef.current.material as THREE.MeshBasicMaterial).color.set(theme.auraColor);
      }
      if (diceEnergyRingRef.current) {
        (diceEnergyRingRef.current.material as THREE.MeshBasicMaterial).color.set(theme.accentColor);
      }
    }
  }, [activeCharId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software GL detection
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer & Scene
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a17);
    scene.fog = new THREE.FogExp2(0x0c0a17, 0.016);
    sceneRef.current = scene;

    // 3. Studio Environment Map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Cameras
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 36, 42);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 5. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xd8b4fe, 0x1e1b4b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(22, 38, 26);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.left = -28;
    keyLight.shadow.camera.right = 28;
    keyLight.shadow.camera.top = 28;
    keyLight.shadow.camera.bottom = -28;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xec4899, 1.4);
    rimLight.position.set(-20, 20, -25);
    scene.add(rimLight);

    const goldPoint = new THREE.PointLight(0xfacc15, 2.0, 40);
    goldPoint.position.set(0, 10, -14);
    scene.add(goldPoint);

    // 6. Arena Base Platform
    const arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    const baseGeometry = new THREE.CylinderGeometry(25, 26, 1.2, 48);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x130e26,
      roughness: 0.65,
      metalness: 0.35,
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = -0.7;
    baseMesh.receiveShadow = true;
    arenaGroup.add(baseMesh);

    // Outer Glowing Runic Ring
    const ringGeo = new THREE.TorusGeometry(25.2, 0.25, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.1;
    arenaGroup.add(ringMesh);

    // 7. Generate 100 3D Board Tiles
    const tileGeo = new THREE.BoxGeometry(2.7, 0.5, 2.7);

    for (let i = 1; i <= 100; i++) {
      const coords = getCellCoordinates(i);
      const special = SPECIAL_CELLS[i];

      // Procedural Canvas Texture for crisp numbers & styling
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Tile background
        if (special) {
          ctx.fillStyle = special.colorHex;
          ctx.fillRect(0, 0, 128, 128);
          // Darker inset border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 8;
          ctx.strokeRect(4, 4, 120, 120);
        } else {
          ctx.fillStyle = i % 2 === 0 ? '#f8fafc' : '#e2e8f0';
          ctx.fillRect(0, 0, 128, 128);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, 124, 124);
        }

        // Cell number
        ctx.fillStyle = special ? '#ffffff' : '#0f172a';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(String(i), 10, 10);

        // Special icon text if applicable
        if (i === 100) {
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 26px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('HEAVEN', 64, 76);
        } else if (special) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          const shortName = special.standName.split(' ')[0];
          ctx.fillText(shortName.toUpperCase(), 64, 84);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const tileMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: special ? 0.35 : 0.6,
        metalness: special ? 0.4 : 0.1,
        emissive: special ? new THREE.Color(special.colorHex) : new THREE.Color(0x000000),
        emissiveIntensity: special ? 0.25 : 0,
      });

      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(coords.x, coords.y, coords.z);
      tileMesh.castShadow = !isSoftwareGl;
      tileMesh.receiveShadow = true;
      tileMesh.userData = {
        cellNumber: i,
        isHazard: !!special?.isHazard,
        baseY: coords.y,
        baseColorHex: special?.colorHex || '#ffffff',
      };
      arenaGroup.add(tileMesh);
      tilesMeshMapRef.current.set(i, tileMesh);

      // Create Danger Warning Beacon for Hazard Tiles
      if (special?.isHazard) {
        const beaconGroup = new THREE.Group();
        beaconGroup.position.set(coords.x, coords.y + 0.5, coords.z);

        // Pulsing Warning Ring
        const warnRingGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 32);
        const warnRingMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 1.8,
          transparent: true,
          opacity: 0.85,
        });
        const warnRing = new THREE.Mesh(warnRingGeo, warnRingMat);
        warnRing.rotation.x = Math.PI / 2;
        beaconGroup.add(warnRing);

        // Warning Light Beam Pillar
        const beamGeo = new THREE.CylinderGeometry(0.8, 1.1, 2.5, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xff0044,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.y = 1.25;
        beaconGroup.add(beamMesh);

        beaconGroup.visible = false; // Initially hidden until player within 6 tiles!
        arenaGroup.add(beaconGroup);
        hazardBeaconsRef.current.set(i, beaconGroup);
      }
    }

    // 8. The Towering Golden Requiem Arrow at Goal Cell
    const arrowGroup = new THREE.Group();
    const arrowCoords = getCellCoordinates(boardLength || 100);
    arrowGroup.position.set(arrowCoords.x, arrowCoords.y + 2.2, arrowCoords.z);

    // Arrow Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xca8a04,
      emissiveIntensity: 0.6,
    });
    const shaftMesh = new THREE.Mesh(shaftGeo, goldMat);
    arrowGroup.add(shaftMesh);

    // Arrow Head / Beetle Tip
    const headGeo = new THREE.ConeGeometry(0.5, 1.2, 4);
    const headMesh = new THREE.Mesh(headGeo, goldMat);
    headMesh.position.y = 1.6;
    headMesh.rotation.y = Math.PI / 4;
    arrowGroup.add(headMesh);

    // Revolving Stand Halo
    const haloGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 32);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xfacc15,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    arrowGroup.add(haloMesh);

    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    // 9. Floating 3D Menacing Kanji (ゴゴゴ)
    const kanjiList: THREE.Group[] = [];
    const kanjiCanvas = document.createElement('canvas');
    kanjiCanvas.width = 128;
    kanjiCanvas.height = 128;
    const kCtx = kanjiCanvas.getContext('2d');
    if (kCtx) {
      kCtx.fillStyle = '#a855f7';
      kCtx.shadowColor = '#000000';
      kCtx.shadowBlur = 8;
      kCtx.font = 'bold 88px Bangers, Arial, sans-serif';
      kCtx.textAlign = 'center';
      kCtx.textBaseline = 'middle';
      kCtx.fillText('ゴ', 64, 64);
    }
    const kanjiTex = new THREE.CanvasTexture(kanjiCanvas);
    kanjiTex.colorSpace = THREE.SRGBColorSpace;

    for (let k = 0; k < 6; k++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: kanjiTex,
        color: 0xc084fc,
        transparent: true,
        opacity: 0.75,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(3, 3, 1);
      const angle = (k / 6) * Math.PI * 2;
      sprite.position.set(Math.cos(angle) * 16, 4 + Math.sin(k) * 2, Math.sin(angle) * 16);
      scene.add(sprite);
      const grp = new THREE.Group();
      grp.add(sprite);
      grp.userData = { baseAngle: angle, speed: 0.3 + k * 0.1, initialY: sprite.position.y };
      kanjiList.push(grp);
    }
    menacingKanjiRef.current = kanjiList;

    // 10. 3D Rolling Character-Themed Dice Group
    const diceGroup = new THREE.Group();
    const diceGeo = new RoundedBoxGeometry(2.2, 2.2, 2.2, 3, 0.28);

    const initialCharId = players[currentPlayerIndex]?.character?.id || 'jotaro';
    const diceMaterials = getDiceMaterialsForCharacter(initialCharId, renderer);

    const diceMesh = new THREE.Mesh(diceGeo, diceMaterials);
    diceMesh.castShadow = !isSoftwareGl;
    diceGroup.add(diceMesh);
    diceMeshRef.current = diceMesh;

    // Thematic Stand Aura Ring that pulses beneath and around the dice
    const auraTheme = getCharacterDiceTheme(initialCharId);
    const auraGeo = new THREE.TorusGeometry(1.8, 0.08, 16, 48);
    const auraMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(auraTheme.auraColor),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const auraRing = new THREE.Mesh(auraGeo, auraMat);
    auraRing.rotation.x = Math.PI / 2;
    auraRing.position.y = -1.2;
    diceGroup.add(auraRing);
    diceAuraRingRef.current = auraRing;

    // Second concentric spinning energy ring
    const energyGeo = new THREE.RingGeometry(1.4, 1.7, 32);
    const energyMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(auraTheme.accentColor),
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const energyRing = new THREE.Mesh(energyGeo, energyMat);
    energyRing.rotation.x = Math.PI / 2;
    energyRing.position.y = -1.22;
    diceGroup.add(energyRing);
    diceEnergyRingRef.current = energyRing;

    diceGroup.position.set(0, 4, 0);
    diceGroup.visible = false;
    scene.add(diceGroup);
    diceGroupRef.current = diceGroup;

    // 11. Pointer & Touch Controls for Orbit/Tilt
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - pointerPosRef.current.x;
      const dy = e.clientY - pointerPosRef.current.y;
      pointerPosRef.current = { x: e.clientX, y: e.clientY };

      if (viewModeRef.current === '3d-tactical') {
        // Scrollable top-down arena view: Drag up/down to see entire board!
        // Dragging up (dy < 0) pans toward Cell 100 (negative Z)
        const nextZ = Math.max(-15, Math.min(15, tacticalScrollZRef.current + dy * 0.08));
        tacticalScrollZRef.current = nextZ;
        setTacticalScroll(Math.round(nextZ));
      } else {
        orbitRef.current.theta -= dx * 0.008;
        orbitRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + dy * 0.008));
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (viewModeRef.current === '3d-tactical') {
        // Scroll wheel moves camera smoothly from Cell 1 to Cell 100!
        const nextZ = Math.max(-15, Math.min(15, tacticalScrollZRef.current - e.deltaY * 0.03));
        tacticalScrollZRef.current = nextZ;
        setTacticalScroll(Math.round(nextZ));
      } else {
        orbitRef.current.radius = Math.max(16, Math.min(75, orbitRef.current.radius + e.deltaY * 0.04));
      }
    };

    // Click raycaster on board tiles
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);

      const intersects = raycaster.intersectObjects(arenaGroup.children);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.cellNumber && onTileClick) {
          onTileClick(hit.userData.cellNumber);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('click', handleClick);

    // 12. Handle Resize with ResizeObserver & Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // 13. Main Three.js Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();
    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();

    const tick = () => {
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate Towering Arrow
      if (arrowGroupRef.current) {
        arrowGroupRef.current.rotation.y += dt * 1.5;
        arrowGroupRef.current.position.y = arrowCoords.y + 2.0 + Math.sin(elapsed * 3) * 0.35;
      }

      // Animate Menacing Kanji
      menacingKanjiRef.current.forEach((grp) => {
        const u = grp.userData;
        const currentAngle = u.baseAngle + elapsed * u.speed * 0.2;
        const sprite = grp.children[0] as THREE.Sprite;
        if (sprite) {
          sprite.position.x = Math.cos(currentAngle) * 17;
          sprite.position.z = Math.sin(currentAngle) * 17;
          sprite.position.y = u.initialY + Math.sin(elapsed * 2 + u.baseAngle) * 1.2;
        }
      });

      // Visual Warning Pulse Effect on Hazard Cells within 6 tiles of active player!
      const currentPlayers = playersRef.current;
      const activeP = currentPlayers[currentIdxRef.current];
      if (activeP) {
        tilesMeshMapRef.current.forEach((tileMesh, cellNum) => {
          if (tileMesh.userData.isHazard) {
            const distance = cellNum - activeP.pos;
            const beacon = hazardBeaconsRef.current.get(cellNum);
            const mat = tileMesh.material as THREE.MeshStandardMaterial;

            if (distance > 0 && distance <= 6) {
              // Danger Ahead! Within 6 tiles:
              const pulse = Math.sin(elapsed * 10);
              mat.emissive.setHex(0xef4444);
              mat.emissiveIntensity = 0.8 + pulse * 0.6;
              tileMesh.position.y = tileMesh.userData.baseY + Math.max(0, pulse * 0.18);

              if (beacon) {
                beacon.visible = true;
                beacon.rotation.y += dt * 3;
                const scale = 1 + pulse * 0.15;
                beacon.scale.set(scale, scale, scale);
              }
            } else {
              // Reset to normal state
              mat.emissive.set(new THREE.Color(tileMesh.userData.baseColorHex));
              mat.emissiveIntensity = 0.25;
              tileMesh.position.y = tileMesh.userData.baseY;
              if (beacon) {
                beacon.visible = false;
              }
            }
          }
        });
      }

      // Update Character Pawn Positions smoothly
      currentPlayers.forEach((p, idx) => {
        let pawnGroup = pawnsRef.current.get(p.id);
        if (!pawnGroup) {
          // Construct 6-Part Procedural Stand Pawn
          pawnGroup = new THREE.Group();

          // 1. Stand Aura Ring
          const auraGeo = new THREE.TorusGeometry(1.05, 0.08, 16, 32);
          const auraMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(p.character.hexColor),
            emissive: new THREE.Color(p.character.hexColor),
            emissiveIntensity: 1.4,
            roughness: 0.2,
          });
          const auraMesh = new THREE.Mesh(auraGeo, auraMat);
          auraMesh.rotation.x = Math.PI / 2;
          auraMesh.position.y = 0.15;
          pawnGroup.add(auraMesh);

          // 2. Pedestal Disc
          const pedGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.3, 24);
          const pedMat = new THREE.MeshStandardMaterial({
            color: 0x1e1b4b,
            metalness: 0.6,
            roughness: 0.3,
          });
          const pedMesh = new THREE.Mesh(pedGeo, pedMat);
          pedMesh.position.y = 0.2;
          pawnGroup.add(pedMesh);

          // 3. Body Capsule / Torso
          const bodyGeo = new THREE.CapsuleGeometry(0.5, 0.9, 8, 16);
          const bodyMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(p.character.hexColor),
            metalness: 0.3,
            roughness: 0.4,
          });
          const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
          bodyMesh.position.y = 1.0;
          pawnGroup.add(bodyMesh);

          // 4. Gold Trim Collar
          const colGeo = new THREE.TorusGeometry(0.55, 0.07, 12, 24);
          const colMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            metalness: 0.9,
            roughness: 0.2,
          });
          const colMesh = new THREE.Mesh(colGeo, colMat);
          colMesh.rotation.x = Math.PI / 2;
          colMesh.position.y = 1.45;
          pawnGroup.add(colMesh);

          // 5. Crown / Stand Visor
          const visorGeo = new THREE.BoxGeometry(0.7, 0.25, 0.65);
          const visorMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: new THREE.Color(p.character.accentHex),
            emissiveIntensity: 0.8,
            roughness: 0.1,
          });
          const visorMesh = new THREE.Mesh(visorGeo, visorMat);
          visorMesh.position.set(0, 1.6, 0.15);
          pawnGroup.add(visorMesh);

          // 6. Floating Character Emblem Sprite
          const emCanvas = document.createElement('canvas');
          emCanvas.width = 128;
          emCanvas.height = 128;
          const eCtx = emCanvas.getContext('2d');
          if (eCtx) {
            eCtx.fillStyle = p.character.hexColor;
            eCtx.beginPath();
            eCtx.arc(64, 64, 58, 0, Math.PI * 2);
            eCtx.fill();
            eCtx.strokeStyle = '#ffffff';
            eCtx.lineWidth = 6;
            eCtx.stroke();

            eCtx.fillStyle = '#ffffff';
            eCtx.font = 'bold 50px Arial';
            eCtx.textAlign = 'center';
            eCtx.textBaseline = 'middle';
            eCtx.fillText(p.character.badgeSymbol, 64, 66);
          }
          const emTex = new THREE.CanvasTexture(emCanvas);
          emTex.colorSpace = THREE.SRGBColorSpace;
          const emSpriteMat = new THREE.SpriteMaterial({ map: emTex });
          const emSprite = new THREE.Sprite(emSpriteMat);
          emSprite.scale.set(1.4, 1.4, 1);
          emSprite.position.set(0, 2.5, 0);
          pawnGroup.add(emSprite);

          pawnGroup.userData = {
            targetX: 0,
            targetZ: 0,
            targetY: 0,
            offsetAngle: (idx / Math.max(1, currentPlayers.length)) * Math.PI * 2,
          };

          scene.add(pawnGroup);
          pawnsRef.current.set(p.id, pawnGroup);
        }

        // Calculate target location on board
        const coords = getCellCoordinates(p.pos);
        // Slightly spread out pawns if sharing the same cell
        const sharedCount = currentPlayers.filter((other) => other.pos === p.pos).length;
        let offsetX = 0;
        let offsetZ = 0;
        if (sharedCount > 1) {
          const offsetDist = 0.65;
          const angle = pawnGroup.userData.offsetAngle || 0;
          offsetX = Math.cos(angle) * offsetDist;
          offsetZ = Math.sin(angle) * offsetDist;
        }

        const targetX = coords.x + offsetX;
        const targetZ = coords.z + offsetZ;
        const targetY = coords.y;

        // Smooth Exponential Damping for positions
        pawnGroup.position.x = THREE.MathUtils.damp(pawnGroup.position.x, targetX, 8, dt);
        pawnGroup.position.z = THREE.MathUtils.damp(pawnGroup.position.z, targetZ, 8, dt);
        pawnGroup.position.y = THREE.MathUtils.damp(pawnGroup.position.y, targetY, 8, dt);

        // Gentle breathing float on Stand aura
        pawnGroup.rotation.y = Math.sin(elapsed * 2 + idx) * 0.15;
      });

      // 3D Dice Animation
      if (diceGroupRef.current) {
        if (rollingRef.current) {
          diceGroupRef.current.visible = true;
          diceGroupRef.current.position.y = 5.5 + Math.sin(elapsed * 14) * 0.8;
          diceGroupRef.current.rotation.x += dt * 22;
          diceGroupRef.current.rotation.y += dt * 26;
          diceGroupRef.current.rotation.z += dt * 18;

          // Stand Aura dynamic surge while rolling
          if (diceAuraRingRef.current) {
            diceAuraRingRef.current.rotation.z += dt * 8;
            const auraScale = 1.0 + Math.sin(elapsed * 24) * 0.22;
            diceAuraRingRef.current.scale.set(auraScale, auraScale, auraScale);
          }
          if (diceEnergyRingRef.current) {
            diceEnergyRingRef.current.rotation.z -= dt * 6;
            const energyScale = 1.1 + Math.cos(elapsed * 20) * 0.18;
            diceEnergyRingRef.current.scale.set(energyScale, energyScale, energyScale);
          }
        } else if (diceValRef.current !== null) {
          diceGroupRef.current.visible = true;
          // Smoothly descend to ground level near board
          diceGroupRef.current.position.y = THREE.MathUtils.damp(diceGroupRef.current.position.y, 1.4, 12, dt);
          diceGroupRef.current.position.x = THREE.MathUtils.damp(diceGroupRef.current.position.x, 0, 10, dt);
          diceGroupRef.current.position.z = THREE.MathUtils.damp(diceGroupRef.current.position.z, 2, 10, dt);

          // Aura settles beneath the resting dice like a Stand summoning glyph
          if (diceAuraRingRef.current) {
            diceAuraRingRef.current.rotation.z += dt * 1.2;
            diceAuraRingRef.current.scale.set(1.0, 1.0, 1.0);
          }
          if (diceEnergyRingRef.current) {
            diceEnergyRingRef.current.rotation.z -= dt * 0.8;
            diceEnergyRingRef.current.scale.set(1.0, 1.0, 1.0);
          }

          // Box faces: 0=+X(1), 1=-X(2), 2=+Y(3), 3=-Y(4), 4=+Z(5), 5=-Z(6)
          // Orient the cube so the rolled number face faces upward toward the camera
          const val = diceValRef.current;
          let targetRotX = 0;
          let targetRotY = 0;
          let targetRotZ = 0;

          if (val === 1) {
            // Face 1 (+X) up: rotate Z by -PI/2
            targetRotZ = -Math.PI / 2;
          } else if (val === 2) {
            // Face 2 (-X) up: rotate Z by PI/2
            targetRotZ = Math.PI / 2;
          } else if (val === 3) {
            // Face 3 (+Y) up: default orientation
            targetRotX = 0;
            targetRotZ = 0;
          } else if (val === 4) {
            // Face 4 (-Y) up: rotate X by PI
            targetRotX = Math.PI;
          } else if (val === 5) {
            // Face 5 (+Z) up: rotate X by -PI/2
            targetRotX = -Math.PI / 2;
          } else if (val === 6) {
            // Face 6 (-Z) up: rotate X by PI/2
            targetRotX = Math.PI / 2;
          }

          diceGroupRef.current.rotation.x = THREE.MathUtils.damp(diceGroupRef.current.rotation.x, targetRotX, 14, dt);
          diceGroupRef.current.rotation.y = THREE.MathUtils.damp(diceGroupRef.current.rotation.y, targetRotY, 14, dt);
          diceGroupRef.current.rotation.z = THREE.MathUtils.damp(diceGroupRef.current.rotation.z, targetRotZ, 14, dt);
        } else {
          diceGroupRef.current.visible = false;
        }
      }

      // Dynamic mobile/tablet aspect ratio compensation
      const aspect = camera.aspect;
      const isPortrait = aspect < 1.0;
      // In portrait orientation (phones & tall tablets), narrow FOV requires proportional camera pullback
      const portraitMultiplier = isPortrait ? Math.max(1, 0.95 / Math.max(0.48, aspect)) : 1.0;

      // Camera Modes
      const mode = viewModeRef.current;
      const activePlayer = currentPlayers[currentIdxRef.current];

      if (mode === '3d-action' && activePlayer) {
        // Track the active character dynamically with mobile framing compensation
        const pCoords = getCellCoordinates(activePlayer.pos);
        targetLookAt.set(pCoords.x, pCoords.y + 1.2, pCoords.z);
        targetCamPos.set(
          pCoords.x,
          pCoords.y + 13 * portraitMultiplier,
          pCoords.z + 17 * portraitMultiplier
        );

        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 4, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 4, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 4, dt);
        camera.lookAt(targetLookAt);
      } else if (mode === '3d-tactical') {
        // High-angle arena view scaled for phone and tablet screens
        const scrollZ = tacticalScrollZRef.current;
        targetLookAt.set(0, 0, scrollZ);
        targetCamPos.set(0, 42 * portraitMultiplier, 16 + scrollZ);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 6, dt);
        camera.lookAt(targetLookAt);
      } else {
        // Free Orbit Mode based on pointer controls
        const orb = orbitRef.current;
        const adjustedRadius = orb.radius * (isPortrait ? 1.2 : 1.0);
        const ox = adjustedRadius * Math.sin(orb.phi) * Math.sin(orb.theta);
        const oy = adjustedRadius * Math.cos(orb.phi);
        const oz = adjustedRadius * Math.sin(orb.phi) * Math.cos(orb.theta);

        targetCamPos.set(ox, oy, oz);
        targetLookAt.set(0, 0, 0);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 10, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 10, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 10, dt);
        camera.lookAt(targetLookAt);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleClick);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative touch-none">
      <div
        ref={mountRef}
        className={`w-full h-full relative cursor-grab active:cursor-grabbing touch-none select-none ${
          isTimeStopped ? 'time-stop-active' : ''
        }`}
      />

      {/* Floating Tactical Navigation Controls for Top-Down View */}
      {viewMode === '3d-tactical' && (
        <div className="absolute right-2 top-16 md:right-4 md:top-20 z-30 flex flex-col items-center bg-slate-950/90 backdrop-blur-md border border-purple-500/60 rounded-xl p-1.5 md:p-2.5 shadow-xl gap-1 md:gap-2 select-none animate-in fade-in duration-200">
          <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bangers text-yellow-400 tracking-wider">
            <span>🔭 BOARD SCROLL</span>
          </div>

          <button
            onClick={() => jumpToZ(-14)}
            className="w-full px-2 py-0.5 md:px-2.5 md:py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/60 rounded text-[10px] md:text-[11px] font-bold transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
            title="Scroll to Heaven (Cell 81-100)"
          >
            ▲ Heaven (100)
          </button>

          <button
            onClick={() => jumpToZ(0)}
            className="w-full px-2 py-0.5 md:px-2.5 md:py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/60 rounded text-[10px] md:text-[11px] font-bold transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
            title="Scroll to Center (Cell 41-60)"
          >
            ● Center (50)
          </button>

          <button
            onClick={() => jumpToZ(14)}
            className="w-full px-2 py-0.5 md:px-2.5 md:py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/60 rounded text-[10px] md:text-[11px] font-bold transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
            title="Scroll to Start (Cell 1-20)"
          >
            ▼ Start (1)
          </button>

          {/* Smooth range slider */}
          <div className="flex flex-col items-center mt-0.5 pt-1 border-t border-slate-800 w-full">
            <span className="text-[8px] md:text-[9px] text-slate-300 font-mono mb-0.5 font-semibold">
              {tacticalScroll <= -7 ? 'Rows 8-10' : tacticalScroll >= 7 ? 'Rows 1-3' : 'Rows 4-7'}
            </span>
            <input
              type="range"
              min="-14"
              max="14"
              step="1"
              value={tacticalScroll}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                tacticalScrollZRef.current = val;
                setTacticalScroll(val);
              }}
              className="w-16 md:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>
          <span className="text-[8px] text-slate-400 text-center max-w-[80px] leading-tight hidden sm:block">
            Drag or scroll wheel to pan
          </span>
        </div>
      )}
    </div>
  );
};
