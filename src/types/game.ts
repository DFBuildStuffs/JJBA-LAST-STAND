export type CharacterId =
  | 'jotaro'
  | 'giorno'
  | 'josuke'
  | 'joseph'
  | 'jolyne'
  | 'johnny'
  | 'jonathan'
  | 'dio'
  | 'kira';

export type AbilityType = 'attack' | 'movement' | 'buff' | 'utility';
export type StanceType = 'rush' | 'precision' | 'guard' | 'burst';
export type AiDifficulty = 'easy' | 'normal' | 'hard';

export interface StandAbility {
  id: string;
  name: string;
  standName: string;
  spCost: number;
  cooldownTurns: number;
  description: string;
  voiceLine: string;
  type: AbilityType;
}

export interface Character {
  id: CharacterId;
  name: string;
  part: string;
  stand: string;
  standCry: string;
  hexColor: string;
  secondaryHex: string;
  accentHex: string;
  badgeSymbol: string;
  quote: string;
  abilities: StandAbility[];
}

export interface PlayerBuffs {
  shieldTurns: number;
  doubleRollNext: boolean;
  reflectTurns: number;
  precisionChoice: boolean;
}

export interface Player {
  id: number;
  name: string;
  character: Character;
  pos: number; // 1 to 50 or 100
  prevPos: number;
  hp: number; // Willpower / Health: 0 to 100
  maxHp: number;
  sp: number; // Stand Power: 0 to 100
  maxSp: number;
  missTurns: number;
  extraRolls: number;
  isAi: boolean;
  finishedRank: number | null;
  buffs: PlayerBuffs;
  abilityCooldowns: Record<string, number>;
  clashWins: number;
}

export interface SpecialCell {
  cellNumber: number;
  name: string;
  standName: string;
  colorHex: string;
  cry: string;
  effectLabel: string;
  description: string;
  targetCell?: number;
  moveOffset?: number;
  isHazard?: boolean;
  isShortcut?: boolean;
  damage?: number;
  audioSrc?: string;
}

export type GameMode = 'ai' | 'pass-and-play' | 'online';
export type DiceMode = 'auto' | 'manual';
export type ViewMode = '3d-action' | '3d-tactical' | '3d-orbit' | '2d';
export type BoardLength = 100;

export interface OnlinePlayerInfo {
  id: number;
  socketId: string;
  name: string;
  characterId: CharacterId;
  isHost: boolean;
  isReady: boolean;
  pos: number;
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  missTurns: number;
  extraRolls: number;
  finishedRank: number | null;
  clashWins: number;
  buffs: PlayerBuffs;
  abilityCooldowns: Record<string, number>;
}

export interface OnlineRoomState {
  code: string;
  status: 'lobby' | 'playing' | 'victory';
  hostSocketId: string;
  players: OnlinePlayerInfo[];
  currentPlayerIndex: number;
  rankCounter: number;
  diceValue: number | null;
  isTurnBusy: boolean;
  clashData: StandClashData | null;
  winner: OnlinePlayerInfo | null;
  lastAction?: {
    type: string;
    playerId: number;
    description: string;
  };
}

export interface DangerAheadInfo {
  cellNumber: number;
  distance: number;
  name: string;
  standName: string;
  effect: string;
}

export interface StandClashData {
  attacker: Player;
  defender: Player;
  attackerScore: number;
  defenderScore: number;
  timeLeft: number;
  winnerId: number | null;
  difficulty?: AiDifficulty;
}

export interface ActionBannerData {
  title: string;
  subtitle: string;
  cry: string;
  characterName: string;
  colorHex: string;
  type: 'attack' | 'warp' | 'hazard' | 'buff' | 'win' | 'timestop' | 'clash' | 'stand';
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'stand' | 'hazard' | 'buff' | 'win' | 'attack' | 'clash';
  time: string;
}
