export type DialogueTrigger = 'turn_start' | 'special_cell' | 'clash_win';

export interface CharacterVoiceLine {
  id: string;
  characterId: string;
  trigger: DialogueTrigger;
  dialogue: string;
  japaneseRomaji: string;
  kanji: string;
  soundEffectUrl: string;
  speechPitch: number;
  speechRate: number;
  accentColor: string;
  subtitleCategory: string;
}

export const CHARACTER_VOICE_LINES: CharacterVoiceLine[] = [
  // ==================== JOTARO KUJO ====================
  {
    id: 'jotaro_turn_start',
    characterId: 'jotaro',
    trigger: 'turn_start',
    dialogue: 'Good grief... my turn. Star Platinum, let us move.',
    japaneseRomaji: 'Yare Yare Daze... Ore no ban da.',
    kanji: 'やれやれだぜ…',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
    speechPitch: 0.7,
    speechRate: 0.95,
    accentColor: '#dc2626',
    subtitleCategory: 'STAR PLATINUM AWAKEN',
  },
  {
    id: 'jotaro_special_cell',
    characterId: 'jotaro',
    trigger: 'special_cell',
    dialogue: 'A special tile? Star Platinum will smash right through it! ORA!',
    japaneseRomaji: 'Kono te no wana wa Star Platinum de buchiyaburu! ORAAA!',
    kanji: 'オラァッ！突き破るぜ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 0.75,
    speechRate: 1.05,
    accentColor: '#ef4444',
    subtitleCategory: 'TACTICAL STAND BREAK',
  },
  {
    id: 'jotaro_clash_win',
    characterId: 'jotaro',
    trigger: 'clash_win',
    dialogue: 'The only reason you lost... was because you pissed me off. ORA ORA ORA!',
    japaneseRomaji: 'Temē no haiin wa... tatta hitotsu da. Temē wa ore o okoraseta! ORA ORA ORA!',
    kanji: 'てめーは俺を怒らせた！オラオラオラ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    speechPitch: 0.72,
    speechRate: 1.1,
    accentColor: '#b91c1c',
    subtitleCategory: 'CLASH FINISHER: ORA BARRAGE',
  },

  // ==================== DIO BRANDO ====================
  {
    id: 'dio_turn_start',
    characterId: 'dio',
    trigger: 'turn_start',
    dialogue: 'It was I, DIO! All mortals shall bow before The World!',
    japaneseRomaji: 'Kono DIO da! Subete no ningen wa kono DIO no mae ni hizamazuku!',
    kanji: 'このDIOだッ！ひれ伏せ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
    speechPitch: 1.15,
    speechRate: 1.05,
    accentColor: '#eab308',
    subtitleCategory: 'THE WORLD MANIFEST',
  },
  {
    id: 'dio_special_cell',
    characterId: 'dio',
    trigger: 'special_cell',
    dialogue: 'Za Warudo! Time itself bends to my will! MUDA MUDA MUDA!',
    japaneseRomaji: 'Za Warudo! Toki yo tomare! Muda muda muda muda!',
    kanji: '「世界」時よ止まれッ！無駄無駄無駄！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg',
    speechPitch: 1.18,
    speechRate: 1.15,
    accentColor: '#ca8a04',
    subtitleCategory: 'TIME STOP ACCELERATION',
  },
  {
    id: 'dio_clash_win',
    characterId: 'dio',
    trigger: 'clash_win',
    dialogue: 'WRYYYYYYYY! You thought you could defeat DIO?! Incompetent fool!',
    japaneseRomaji: 'WRYYYYYYY! Kono DIO ni kateru to omotta ka?! Mudadane!',
    kanji: '最高に「ハイ！」ってやつだッ！WRYYYY！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 1.25,
    speechRate: 1.2,
    accentColor: '#f59e0b',
    subtitleCategory: 'CLASH FINISHER: WRYYYYY',
  },

  // ==================== GIORNO GIOVANNA ====================
  {
    id: 'giorno_turn_start',
    characterId: 'giorno',
    trigger: 'turn_start',
    dialogue: 'I, Giorno Giovanna, have a dream that I know is just.',
    japaneseRomaji: 'Kono Giorno Giovanna ni wa yume ga aru!',
    kanji: 'このジョルノ・ジョバァーナには夢がある！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    speechPitch: 1.0,
    speechRate: 1.0,
    accentColor: '#eab308',
    subtitleCategory: 'GOLDEN WIND RESOLVE',
  },
  {
    id: 'giorno_special_cell',
    characterId: 'giorno',
    trigger: 'special_cell',
    dialogue: 'Gold Experience! Life springs forth and paves our golden road!',
    japaneseRomaji: 'Gold Experience! Inochi ga mebaeru! Muda!',
    kanji: '生まれろ生命よ！ゴールド・エクスペリエンス！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
    speechPitch: 1.02,
    speechRate: 1.05,
    accentColor: '#facc15',
    subtitleCategory: 'LIFE SPRING TRANSCENDENCE',
  },
  {
    id: 'giorno_clash_win',
    characterId: 'giorno',
    trigger: 'clash_win',
    dialogue: 'You will never reach reality! MUDA MUDA MUDA MUDA MUDA!',
    japaneseRomaji: 'Kore ga Requiem da! Shinjitsu ni tōtatsu suru koto wa kesshite nai! MUDA!',
    kanji: 'これがレクイエムだ。無駄無駄無駄無駄ッ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    speechPitch: 1.08,
    speechRate: 1.15,
    accentColor: '#e11d48',
    subtitleCategory: 'CLASH FINISHER: SEVEN-PAGE MUDA',
  },

  // ==================== JOSUKE HIGASHIKATA ====================
  {
    id: 'josuke_turn_start',
    characterId: 'josuke',
    trigger: 'turn_start',
    dialogue: 'Great daze! Let us fix up this game and take the lead!',
    japaneseRomaji: 'Gureeto daze! Kono kachi-sen wa itadaita!',
    kanji: 'グレートだぜ…！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg',
    speechPitch: 1.1,
    speechRate: 1.05,
    accentColor: '#3b82f6',
    subtitleCategory: 'MORIOH PROTECTOR',
  },
  {
    id: 'josuke_special_cell',
    characterId: 'josuke',
    trigger: 'special_cell',
    dialogue: 'Crazy Diamond! I will restore this broken board into our advantage!',
    japaneseRomaji: 'Crazy Diamond! Naoseba ii dake no hanashi daze!',
    kanji: '直せばいいだけの話だぜッ！ドララ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
    speechPitch: 1.12,
    speechRate: 1.08,
    accentColor: '#2563eb',
    subtitleCategory: 'CRAZY DIAMOND RESTORATION',
  },
  {
    id: 'josuke_clash_win',
    characterId: 'josuke',
    trigger: 'clash_win',
    dialogue: 'What did you say about my hair?! DORARARARARARARA! DORA!',
    japaneseRomaji: 'Ima ore no atama no koto nanto itta?! DORARARARARA! DORA!',
    kanji: '俺の頭のことなんつったァーッ？！ドララララ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 1.15,
    speechRate: 1.2,
    accentColor: '#1d4ed8',
    subtitleCategory: 'CLASH FINISHER: RAGE RESTORATION',
  },

  // ==================== JOSEPH JOESTAR ====================
  {
    id: 'joseph_turn_start',
    characterId: 'joseph',
    trigger: 'turn_start',
    dialogue: "Next you're going to say: 'How does Joseph always outsmart me?!'",
    japaneseRomaji: "Tsugi ni omae wa... 'Kono Joseph ni katenai!' to iu!",
    kanji: '次にお前は…「勝てねえ！」と言う！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
    speechPitch: 1.35,
    speechRate: 1.08,
    accentColor: '#84cc16',
    subtitleCategory: 'TRICKSTER PREDICTION',
  },
  {
    id: 'joseph_special_cell',
    characterId: 'joseph',
    trigger: 'special_cell',
    dialogue: 'NIGERUNDAYO, SMOKEY! Run for your lives! Tactical retreat!',
    japaneseRomaji: 'Nigerundayo, Smokey! Kore ga Joestar-ke no hisshō-hō da!',
    kanji: '逃げるんだよォッ！スモーキー！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/transportation/car_horn.ogg',
    speechPitch: 1.4,
    speechRate: 1.25,
    accentColor: '#65a30d',
    subtitleCategory: 'SECRET JOESTAR TECHNIQUE',
  },
  {
    id: 'joseph_clash_win',
    characterId: 'joseph',
    trigger: 'clash_win',
    dialogue: 'OH NOOOOO! Just kidding! You played right into my clacker volley trap!',
    japaneseRomaji: 'Oh my god! Kono Joseph Joestar no keikaku-dōri yo!',
    kanji: 'オー・マイ・ゴッド！計算通りだぜ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
    speechPitch: 1.38,
    speechRate: 1.15,
    accentColor: '#4d7c0f',
    subtitleCategory: 'CLASH FINISHER: CLACKER VOLLEY',
  },

  // ==================== JOLYNE CUJOH ====================
  {
    id: 'jolyne_turn_start',
    characterId: 'jolyne',
    trigger: 'turn_start',
    dialogue: 'Yare yare dawa... Give me a break. Stone Free, time to escape!',
    japaneseRomaji: 'Yare Yare Dawa... Kono koshitsu kara nukedasu!',
    kanji: 'やれやれだわ…ストーン・フリー！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    speechPitch: 1.25,
    speechRate: 1.0,
    accentColor: '#06b6d4',
    subtitleCategory: 'PRISON STRING RESOLVE',
  },
  {
    id: 'jolyne_special_cell',
    characterId: 'jolyne',
    trigger: 'special_cell',
    dialogue: '1,000 Throws! Stone Free unravels every obstacle in our path!',
    japaneseRomaji: 'Sen-bon no itto de kirihiraku! Stone Free!',
    kanji: '千本ノックだッ！道を開けな！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
    speechPitch: 1.28,
    speechRate: 1.1,
    accentColor: '#0891b2',
    subtitleCategory: 'STONE FREE UNRAVEL',
  },
  {
    id: 'jolyne_clash_win',
    characterId: 'jolyne',
    trigger: 'clash_win',
    dialogue: 'ORA ORA ORA! My resolve forms a Mobius Strip that cannot be cut!',
    japaneseRomaji: 'Möbius no wa da! ORA ORA ORA ORAAA!',
    kanji: 'オラオラオラ！メビウスの輪だッ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 1.3,
    speechRate: 1.18,
    accentColor: '#0e7490',
    subtitleCategory: 'CLASH FINISHER: MOBIUS RUSH',
  },

  // ==================== JOHNNY JOESTAR ====================
  {
    id: 'johnny_turn_start',
    characterId: 'johnny',
    trigger: 'turn_start',
    dialogue: 'Lesson 5, Gyro... I will find the golden ratio and spin onward.',
    japaneseRomaji: 'Arigatō Gyro... Lesson 5 da. Kaiten o shinjiru.',
    kanji: 'ありがとう、ジャイロ…レッスン5だ。',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg',
    speechPitch: 0.95,
    speechRate: 0.98,
    accentColor: '#0ea5e9',
    subtitleCategory: 'STEEL BALL SPIN',
  },
  {
    id: 'johnny_special_cell',
    characterId: 'johnny',
    trigger: 'special_cell',
    dialogue: 'Tusk Act 4! The infinite spin breaks across dimensional boundaries!',
    japaneseRomaji: 'Tusk Act 4! Chumimi~n! Jigen no kabe o koeru!',
    kanji: 'チュミミ〜ン！無限の回転！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    speechPitch: 1.0,
    speechRate: 1.1,
    accentColor: '#0284c7',
    subtitleCategory: 'INFINITE ROTATION LEAP',
  },
  {
    id: 'johnny_clash_win',
    characterId: 'johnny',
    trigger: 'clash_win',
    dialogue: 'CHUMIMIN! The Golden Rotation cannot be countered by any stand!',
    japaneseRomaji: 'Chumimi~n! Mugen no kaiten wa dare ni mo tomerarenai!',
    kanji: '無限の回転は誰にも止められない！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 1.05,
    speechRate: 1.15,
    accentColor: '#0369a1',
    subtitleCategory: 'CLASH FINISHER: TUSK ACT 4',
  },

  // ==================== JONATHAN JOESTAR ====================
  {
    id: 'jonathan_turn_start',
    characterId: 'jonathan',
    trigger: 'turn_start',
    dialogue: 'My heart resonates! Heat enough to burn! Hamon breathing... engage!',
    japaneseRomaji: 'Furuēru zo haato! Moetsukiru hodo hīto! Kizamu zo, ketsueki no bīto!',
    kanji: 'ふるえるぞハート！燃えつきるほどヒート！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
    speechPitch: 0.88,
    speechRate: 0.96,
    accentColor: '#3b82f6',
    subtitleCategory: 'HAMON RESONANCE',
  },
  {
    id: 'jonathan_special_cell',
    characterId: 'jonathan',
    trigger: 'special_cell',
    dialogue: 'Sunlight Yellow Overdrive! Sunlight energy shall pierce the shadows!',
    japaneseRomaji: 'Sanraito Ierō Ōbādoraibu! Taiyō no nami yo!',
    kanji: '山吹き色の波紋疾走ッ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
    speechPitch: 0.92,
    speechRate: 1.05,
    accentColor: '#2563eb',
    subtitleCategory: 'SUNLIGHT YELLOW OVERDRIVE',
  },
  {
    id: 'jonathan_clash_win',
    characterId: 'jonathan',
    trigger: 'clash_win',
    dialogue: 'True courage is knowing fear and mastering it! OVERDRIVE!',
    japaneseRomaji: 'Yūki to wa kowasa o shiri, sore o waga mono to suru koto da!',
    kanji: '勇気とは怖さを我が物とすることだッ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    speechPitch: 0.95,
    speechRate: 1.12,
    accentColor: '#1d4ed8',
    subtitleCategory: 'CLASH FINISHER: GENTLEMAN OVERDRIVE',
  },

  // ==================== YOSHIKAGE KIRA ====================
  {
    id: 'kira_turn_start',
    characterId: 'kira',
    trigger: 'turn_start',
    dialogue: 'I merely want to live a quiet and peaceful life without disruption.',
    japaneseRomaji: 'Watashi wa shizuka ni kurashitai dake na no da.',
    kanji: 'わたしは静かに暮らしたいだけなのだ…',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
    speechPitch: 0.78,
    speechRate: 0.92,
    accentColor: '#a855f7',
    subtitleCategory: 'QUIET LIFE COLDNESS',
  },
  {
    id: 'kira_special_cell',
    characterId: 'kira',
    trigger: 'special_cell',
    dialogue: 'Killer Queen has already touched this tile. Click.',
    japaneseRomaji: 'Killer Queen wa sudeni sono masu ni fureteiru. Suitchi-on.',
    kanji: 'キラークイーンは既にそのマスに触れている…',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/stone_drop.ogg',
    speechPitch: 0.82,
    speechRate: 1.0,
    accentColor: '#9333ea',
    subtitleCategory: 'PRIMARY BOMB SWITCH',
  },
  {
    id: 'kira_clash_win',
    characterId: 'kira',
    trigger: 'clash_win',
    dialogue: 'Bites the Dust! Click! Time rewinds and another obstacle is erased.',
    japaneseRomaji: 'Bites the Dust! Kono shunkan o kakutei suru!',
    kanji: 'バイツァ・ダスト！爆破完了だ。',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 0.85,
    speechRate: 1.08,
    accentColor: '#7e22ce',
    subtitleCategory: 'CLASH FINISHER: BITES THE DUST',
  },

  // ==================== SPEEDWAGON ====================
  {
    id: 'speedwagon_turn_start',
    characterId: 'speedwagon',
    trigger: 'turn_start',
    dialogue: 'Even Speedwagon is trembling with excitement! Forward, mate!',
    japaneseRomaji: 'Speedwagon mo damatte wa irarenai ze!',
    kanji: 'スピードワゴンも黙っちゃいねえぜ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    speechPitch: 1.22,
    speechRate: 1.1,
    accentColor: '#f97316',
    subtitleCategory: 'OGRE STREET RESOLVE',
  },
  {
    id: 'speedwagon_special_cell',
    characterId: 'speedwagon',
    trigger: 'special_cell',
    dialogue: 'Coolly retreat! Watch out for that trap, Jonathan!',
    japaneseRomaji: 'Speedwagon wa kūru ni saru ze! Ki o tsukero JoJo!',
    kanji: 'スピードワゴンはクールに去るぜ！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/doors/wood_door_open.ogg',
    speechPitch: 1.25,
    speechRate: 1.15,
    accentColor: '#ea580c',
    subtitleCategory: 'SPEEDWAGON ESCAPE',
  },
  {
    id: 'speedwagon_clash_win',
    characterId: 'speedwagon',
    trigger: 'clash_win',
    dialogue: 'Ogre Street sledgehammer never fails! That is street fighting!',
    japaneseRomaji: 'Ogre Street no otoko o nameru na yo! Konoyarō!',
    kanji: '食らいな！食害通りの意地を見せてやる！',
    soundEffectUrl: 'https://actions.google.com/sounds/v1/impacts/crash.ogg',
    speechPitch: 1.28,
    speechRate: 1.2,
    accentColor: '#c2410c',
    subtitleCategory: 'CLASH FINISHER: SLEDGEHAMMER SLAM',
  },
];

// Helper to find dialogue line by character and trigger
export function getCharacterVoiceLine(
  characterId: string,
  trigger: DialogueTrigger
): CharacterVoiceLine {
  // Normalize ID (e.g. 'vampire_dio' -> 'dio', 'young_dio' -> 'dio')
  let normalizedId = characterId.toLowerCase();
  if (normalizedId.includes('dio')) normalizedId = 'dio';
  if (normalizedId.includes('speedwagon')) normalizedId = 'speedwagon';
  if (normalizedId.includes('jack') || normalizedId.includes('bruford') || normalizedId.includes('tarkus')) {
    normalizedId = 'dio'; // fallback to Dio villain lines for phantom blood villains
  }

  const match = CHARACTER_VOICE_LINES.find(
    (vl) => vl.characterId === normalizedId && vl.trigger === trigger
  );

  if (match) return match;

  // Generic fallback if not matched
  return (
    CHARACTER_VOICE_LINES.find((vl) => vl.trigger === trigger) ||
    CHARACTER_VOICE_LINES[0]
  );
}
