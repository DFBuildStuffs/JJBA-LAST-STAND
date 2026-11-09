export type SoundscapeZone = 'cairo' | 'morioh' | 'mansion';

export interface LocationMeta {
  zone: SoundscapeZone;
  name: string;
  range: string;
  description: string;
  colorHex: string;
  icon: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  src?: string;
  coverEmoji: string;
  themeColor: string;
  tag: string;
  description: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'stardust_crusaders',
    title: 'Stardust Crusaders',
    subtitle: "Jotaro's Theme (Main Theme)",
    artist: 'Yugo Kanno',
    src: '/assets/aistudio/JoJo_s_Bizarre_Adventure__Stardust_Crusaders_OST_-_Stardust_Crusaders_MP3_160K__25e43f9d.mp3',
    coverEmoji: '⭐️',
    themeColor: '#ef4444',
    tag: 'Part 3 OST',
    description: 'Iconic brass fanfares, aggressive electric guitar, and punchy rhythms for high-stakes Stand battles.',
  },
  {
    id: 'il_vento_d_oro',
    title: "Il Vento D'oro",
    subtitle: "Giorno's Theme (Golden Wind)",
    artist: 'Yugo Kanno',
    src: '/assets/aistudio/il_vento_d_oro_MP3_160K__fbe7bdf5.mp3',
    coverEmoji: '🐞',
    themeColor: '#eab308',
    tag: 'Part 5 OST',
    description: 'Legendary piano breakdown, punchy saxophone riffs, and unstoppable groove of Golden Wind.',
  },
  {
    id: 'diamond_is_unbreakable',
    title: 'Diamond is Unbreakable',
    subtitle: "Josuke's Theme (Main Theme)",
    artist: 'Yugo Kanno',
    src: '/assets/aistudio/JoJo_s_Bizarre_Adventure__Diamond_is_Unbreakable_OST_-_Diamond_is_Unbreakable___Main_Theme___MP3_160K__86e1aed5.mp3',
    coverEmoji: '💎',
    themeColor: '#3b82f6',
    tag: 'Part 4 OST',
    description: 'Funky slap bass, triumphant brass fanfares, and energetic breakbeats of Morioh 1999.',
  },
  {
    id: 'stone_ocean',
    title: 'Theme of Stone Ocean',
    subtitle: "Jolyne's Theme (Main Theme)",
    artist: 'Yugo Kanno',
    src: '/assets/aistudio/JoJo_Stone_Ocean_OST_-_Theme_of_Stone_Ocean_MP3_160K__e87ed0fa.mp3',
    coverEmoji: '🦋',
    themeColor: '#06b6d4',
    tag: 'Part 6 OST',
    description: 'High-octane rebellious punk rock, screaming electric guitars, and strings of Green Dolphin Street.',
  },
  {
    id: 'awake',
    title: 'Awake',
    subtitle: 'Pillar Men Theme (Awaken My Masters)',
    artist: 'Taku Iwasaki',
    src: '/assets/aistudio/awake_MP3_160K__eaf7813b.mp3',
    coverEmoji: '🗿',
    themeColor: '#a855f7',
    tag: 'Part 2 OST',
    description: 'Legendary Indian-electronic trap fusion and ancient Aztec chants (Ayayayai!) of ultimate beings.',
  },
  {
    id: 'ambient',
    title: 'Location Ambience',
    subtitle: 'Cairo / Morioh / Mansion Soundscape',
    artist: 'Procedural Audio Engine',
    coverEmoji: '🏜️',
    themeColor: '#f59e0b',
    tag: 'Dynamic Ambience',
    description: 'Location-aware procedural soundscape reacting to the board position (desert winds, town chimes, gothic clock).',
  },
];

export const LOCATION_ZONES: Record<SoundscapeZone, LocationMeta> = {
  cairo: {
    zone: 'cairo',
    name: 'Cairo Desert',
    range: 'Cells 1-33',
    description: 'Howling desert winds and scorching sands of Egypt',
    colorHex: '#f59e0b',
    icon: '🏜️',
  },
  morioh: {
    zone: 'morioh',
    name: 'Morioh Town',
    range: 'Cells 34-66',
    description: 'Golden summer afternoon chimes of 1999 Morioh',
    colorHex: '#3b82f6',
    icon: '🏡',
  },
  mansion: {
    zone: 'mansion',
    name: "DIO's Mansion",
    range: 'Cells 67-100',
    description: 'Gothic cathedral shadows, ticking clock, and dark vampire echoes',
    colorHex: '#9333ea',
    icon: '🏰',
  },
};

export function getZoneForCell(cellNumber: number): SoundscapeZone {
  if (cellNumber <= 33) return 'cairo';
  if (cellNumber <= 66) return 'morioh';
  return 'mansion';
}

class AnimeSoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  // Ambient Engine Nodes
  private ambientMasterGain: GainNode | null = null;
  private cairoGain: GainNode | null = null;
  private moriohGain: GainNode | null = null;
  private mansionGain: GainNode | null = null;
  private currentZone: SoundscapeZone | null = null;
  private isAmbienceStarted: boolean = false;
  private ambientTimerId: number | null = null;

  // BGM Audio Controller
  private bgmAudio: HTMLAudioElement | null = null;
  public currentTrackId: string = 'stardust_crusaders';
  public isBgmPlaying: boolean = false;
  public bgmVolume: number = 0.55;
  private onTrackChangeCallbacks: Array<(trackId: string, isPlaying: boolean) => void> = [];

  public subscribeBgm(cb: (trackId: string, isPlaying: boolean) => void) {
    this.onTrackChangeCallbacks.push(cb);
    return () => {
      this.onTrackChangeCallbacks = this.onTrackChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyBgmChange() {
    this.onTrackChangeCallbacks.forEach((cb) => cb(this.currentTrackId, this.isBgmPlaying));
  }

  private initBgm() {
    if (typeof window === 'undefined') return;
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
      this.bgmAudio.addEventListener('play', () => {
        this.isBgmPlaying = true;
        this.notifyBgmChange();
      });
      this.bgmAudio.addEventListener('pause', () => {
        this.isBgmPlaying = false;
        this.notifyBgmChange();
      });
      this.bgmAudio.addEventListener('ended', () => {
        if (this.isBgmPlaying) this.bgmAudio?.play().catch(() => {});
      });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    if (this.ambientMasterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.ambientMasterGain.gain.cancelScheduledValues(t);
      this.ambientMasterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0.0001 : (this.currentTrackId === 'ambient' ? 0.22 : 0.0001),
        t + 0.3
      );
    }
    this.notifyBgmChange();
    return this.isMuted;
  }

  public playTrack(trackId: string) {
    this.initContext();
    this.initBgm();
    this.currentTrackId = trackId;

    const track = MUSIC_TRACKS.find((t) => t.id === trackId) || MUSIC_TRACKS[0];

    if (trackId === 'ambient') {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
      this.isBgmPlaying = true;
      if (this.ambientMasterGain && this.ctx) {
        const t = this.ctx.currentTime;
        this.ambientMasterGain.gain.cancelScheduledValues(t);
        this.ambientMasterGain.gain.linearRampToValueAtTime(
          this.isMuted ? 0.0001 : 0.22,
          t + 0.3
        );
      }
      this.notifyBgmChange();
      return;
    }

    // MP3 Track selected
    if (this.bgmAudio && track.src) {
      // Duck procedural ambience to silence when MP3 plays
      if (this.ambientMasterGain && this.ctx) {
        const t = this.ctx.currentTime;
        this.ambientMasterGain.gain.cancelScheduledValues(t);
        this.ambientMasterGain.gain.linearRampToValueAtTime(0.0001, t + 0.4);
      }

      if (this.bgmAudio.src !== track.src && !this.bgmAudio.src.endsWith(track.src)) {
        this.bgmAudio.src = track.src;
        this.bgmAudio.load();
      }
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
      this.bgmAudio.play().then(() => {
        this.isBgmPlaying = true;
        this.notifyBgmChange();
      }).catch(() => {
        this.isBgmPlaying = false;
        this.notifyBgmChange();
      });
    }
  }

  public toggleBgm(): boolean {
    this.initContext();
    this.initBgm();

    if (this.currentTrackId === 'ambient') {
      this.isBgmPlaying = !this.isBgmPlaying;
      if (this.ambientMasterGain && this.ctx) {
        const t = this.ctx.currentTime;
        this.ambientMasterGain.gain.cancelScheduledValues(t);
        this.ambientMasterGain.gain.linearRampToValueAtTime(
          this.isBgmPlaying && !this.isMuted ? 0.22 : 0.0001,
          t + 0.2
        );
      }
      this.notifyBgmChange();
      return this.isBgmPlaying;
    }

    if (this.bgmAudio) {
      if (this.bgmAudio.paused) {
        const track = MUSIC_TRACKS.find((t) => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
        if (track.src && (!this.bgmAudio.src || this.bgmAudio.src === '')) {
          this.bgmAudio.src = track.src;
        }
        this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
        this.bgmAudio.play().then(() => {
          this.isBgmPlaying = true;
          this.notifyBgmChange();
        }).catch(() => {});
      } else {
        this.bgmAudio.pause();
        this.isBgmPlaying = false;
        this.notifyBgmChange();
      }
    }
    return this.isBgmPlaying;
  }

  public nextTrack(): string {
    const currentIndex = MUSIC_TRACKS.findIndex((t) => t.id === this.currentTrackId);
    const nextIdx = (currentIndex + 1) % MUSIC_TRACKS.length;
    const nextId = MUSIC_TRACKS[nextIdx].id;
    this.playTrack(nextId);
    return nextId;
  }

  public setBgmVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    this.notifyBgmChange();
  }

  public getCurrentTrack(): MusicTrack {
    return MUSIC_TRACKS.find((t) => t.id === this.currentTrackId) || MUSIC_TRACKS[0];
  }

  // --- LOCATION-AWARE AMBIENT SOUND ENGINE ---
  public updateLocationAmbience(cellNumber: number): SoundscapeZone {
    const targetZone = getZoneForCell(cellNumber);

    this.initContext();
    if (!this.ctx) return targetZone;

    if (!this.isAmbienceStarted) {
      this.setupAmbientNodes();
    }

    if (this.currentZone !== targetZone) {
      this.currentZone = targetZone;
      this.crossfadeToZone(targetZone);
    }

    return targetZone;
  }

  private setupAmbientNodes() {
    if (!this.ctx || this.isAmbienceStarted) return;
    this.isAmbienceStarted = true;

    // Master Ambient Gain
    this.ambientMasterGain = this.ctx.createGain();
    this.ambientMasterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.22, this.ctx.currentTime);
    this.ambientMasterGain.connect(this.ctx.destination);

    // 1. CAIRO DESERT: Filtered Wind Noise + LFO
    this.cairoGain = this.ctx.createGain();
    this.cairoGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.cairoGain.connect(this.ambientMasterGain);

    // Procedural noise buffer
    const bufSize = this.ctx.sampleRate * 2;
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;
    noiseSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // LFO to sweep wind frequency
    const windLfo = this.ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.16, this.ctx.currentTime);
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    noiseSource.connect(windFilter);
    windFilter.connect(this.cairoGain);
    noiseSource.start();
    windLfo.start();

    // 2. MORIOH TOWN: Summer Day Chime Pad & Warm Breeze
    this.moriohGain = this.ctx.createGain();
    this.moriohGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.moriohGain.connect(this.ambientMasterGain);

    // Gentle warm chord drone (D4 / A4 / F#4)
    [293.66, 369.99, 440.0].forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      oscGain.gain.setValueAtTime(0.04, this.ctx!.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.moriohGain!);
      osc.start();
    });

    // 3. DIO'S MANSION: Dark Gothic Sub-Bass Drone & Clock Echo
    this.mansionGain = this.ctx.createGain();
    this.mansionGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.mansionGain.connect(this.ambientMasterGain);

    // Deep 55Hz & detuned 82.4Hz gothic resonance
    [55.0, 82.4].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();
      const lowFilter = this.ctx!.createBiquadFilter();

      osc.type = idx === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(95, this.ctx!.currentTime);

      oscGain.gain.setValueAtTime(0.12, this.ctx!.currentTime);

      osc.connect(lowFilter);
      lowFilter.connect(oscGain);
      oscGain.connect(this.mansionGain!);
      osc.start();
    });

    // Periodic Environmental Ambiance Event Timer (Mansion pendulum clock tick & Morioh radio chime)
    this.startAmbientEventLoop();
  }

  private startAmbientEventLoop() {
    if (this.ambientTimerId) return;

    this.ambientTimerId = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

      const t = this.ctx.currentTime;

      // When in DIO's Mansion: Periodic Gothic Clock Pendulum Tick
      if (this.currentZone === 'mansion') {
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'sine';
        tickOsc.frequency.setValueAtTime(140, t);
        tickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

        tickGain.gain.setValueAtTime(0.06, t);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

        tickOsc.connect(tickGain);
        tickGain.connect(this.mansionGain!);
        tickOsc.start(t);
        tickOsc.stop(t + 0.09);
      }

      // When in Morioh: Periodic Sunny Morioh Radio Chime (5-8s interval)
      if (this.currentZone === 'morioh' && Math.random() < 0.45) {
        const chimeNotes = [587.33, 739.99, 880.0]; // D5 - F#5 - A5
        chimeNotes.forEach((f, idx) => {
          const chimeOsc = this.ctx!.createOscillator();
          const chimeGain = this.ctx!.createGain();
          const chimeT = t + idx * 0.12;

          chimeOsc.type = 'triangle';
          chimeOsc.frequency.setValueAtTime(f, chimeT);

          chimeGain.gain.setValueAtTime(0.05, chimeT);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeT + 0.6);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.moriohGain!);
          chimeOsc.start(chimeT);
          chimeOsc.stop(chimeT + 0.7);
        });
      }
    }, 1800);
  }

  private crossfadeToZone(zone: SoundscapeZone) {
    if (!this.ctx || !this.cairoGain || !this.moriohGain || !this.mansionGain) return;

    const t = this.ctx.currentTime;
    const fadeDuration = 1.6; // 1.6 second smooth transition

    // Fade out all zones
    [this.cairoGain, this.moriohGain, this.mansionGain].forEach((g) => {
      g.gain.cancelScheduledValues(t);
      g.gain.linearRampToValueAtTime(0.0001, t + fadeDuration);
    });

    // Fade in target zone
    let targetGainNode: GainNode;
    let targetVol = 0.22;

    switch (zone) {
      case 'cairo':
        targetGainNode = this.cairoGain;
        targetVol = 0.24;
        break;
      case 'morioh':
        targetGainNode = this.moriohGain;
        targetVol = 0.2;
        break;
      case 'mansion':
        targetGainNode = this.mansionGain;
        targetVol = 0.26;
        break;
    }

    targetGainNode.gain.cancelScheduledValues(t);
    targetGainNode.gain.linearRampToValueAtTime(targetVol, t + fadeDuration);
  }

  public stopAmbience() {
    if (this.ctx && this.ambientMasterGain) {
      const t = this.ctx.currentTime;
      this.ambientMasterGain.gain.cancelScheduledValues(t);
      this.ambientMasterGain.gain.linearRampToValueAtTime(0.0001, t + 0.8);
    }
  }

  public pauseBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.isBgmPlaying = false;
    this.notifyBgmChange();
  }

  // --- SOUND EFFECTS ---
  public playDiceRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const count = 6;
    for (let i = 0; i < count; i++) {
      const t = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280 + Math.random() * 160, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    }
  }

  public playTimeStop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.9);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(70, t + 0.9);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.2);

    for (let i = 1; i <= 3; i++) {
      const tickT = t + 0.35 * i;
      const tickOsc = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();

      tickOsc.type = 'square';
      tickOsc.frequency.setValueAtTime(1200 + (i % 2 === 0 ? 300 : 0), tickT);

      tickGain.gain.setValueAtTime(0.12, tickT);
      tickGain.gain.exponentialRampToValueAtTime(0.001, tickT + 0.04);

      tickOsc.connect(tickGain);
      tickGain.connect(this.ctx.destination);

      tickOsc.start(tickT);
      tickOsc.stop(tickT + 0.05);
    }
  }

  public playTimeResume() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playStandCry() {
    this.playPunchBarrage();
  }

  public playJoJoMoveSound(charId?: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Dramatic Anime Stand Flash / Menacing Chord
    const freqs = [196, 246.94, 293.66, 392]; // G Minor JoJo tension chord
    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.45, t + 0.16);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });

    // 2. Heavy Stand impact whoosh & sub-bass kick
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = 'triangle';
    kickOsc.frequency.setValueAtTime(480, t);
    kickOsc.frequency.exponentialRampToValueAtTime(55, t + 0.22);

    kickGain.gain.setValueAtTime(0.28, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    kickOsc.connect(kickGain);
    kickGain.connect(this.ctx.destination);

    kickOsc.start(t);
    kickOsc.stop(t + 0.25);
  }

  public playPunchBarrage() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const hits = 8;
    for (let i = 0; i < hits; i++) {
      const t = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(180 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    }
  }

  public playStandSummon() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.12, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8 + idx * 0.05);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + 0.9);
    });
  }

  public playWarp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  public playHazard() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [150, 158].forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.18 },
      { f: 1046.5, d: 0.5 },
    ];

    let offset = 0;
    notes.forEach((note) => {
      const t = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      offset += note.d * 0.85;
    });
  }

  public playStepHop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playDangerWarning() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [880, 1100].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.15, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.12);
    });
  }

  public playClashHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playClashFinisher() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.55);
  }
}

export const sound = new AnimeSoundEngine();
