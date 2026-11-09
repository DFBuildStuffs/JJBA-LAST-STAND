import React from 'react';
import { Player } from '../types/game';
import { SPECIAL_CELLS } from '../data/specialCells';

interface Tactical2DBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  boardLength?: number;
  onTileClick?: (cellNumber: number) => void;
}

export const Tactical2DBoard: React.FC<Tactical2DBoardProps> = ({
  players,
  currentPlayerIndex,
  boardLength = 100,
  onTileClick,
}) => {
  // Generate rows 9 down to 0 (top of board is row 9, cells 91-100)
  const rows: number[][] = [];
  for (let r = 9; r >= 0; r--) {
    const rowCells: number[] = [];
    const startNum = r * 10 + 1;
    for (let c = 0; c < 10; c++) {
      rowCells.push(startNum + c);
    }
    // Serpentine order
    if (r % 2 !== 0) {
      rowCells.reverse();
    }
    rows.push(rowCells);
  }

  const activePlayer = players[currentPlayerIndex];

  return (
    <div className="w-full h-full flex items-center justify-center p-2 pt-16 pb-24 md:pt-20 md:pb-24">
      <div className="w-full max-w-[min(94vw,calc(100vh-170px),600px)] aspect-square bg-slate-900/90 border-2 sm:border-4 border-yellow-500 rounded-xl p-1.5 sm:p-2.5 shadow-2xl jojo-box-gold flex flex-col justify-between">
        <div className="grid grid-cols-10 grid-rows-10 gap-0.5 sm:gap-1 w-full h-full">
          {rows.flat().map((cellNum) => {
            const special = SPECIAL_CELLS[cellNum];
            const playersHere = players.filter((p) => p.pos === cellNum && !p.finishedRank);
            const isGoal = cellNum === boardLength;
            const isCurPlayerHere = activePlayer && activePlayer.pos === cellNum;

            let bgStyle = 'bg-slate-800/80 hover:bg-slate-700 border-slate-700';
            if (isGoal) {
              bgStyle = 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-amber-300 text-slate-950 font-black';
            } else if (special) {
              bgStyle = special.isHazard
                ? 'bg-red-950/80 border-red-500 text-red-200'
                : 'bg-purple-950/80 border-purple-400 text-purple-200';
            }

            return (
              <div
                key={cellNum}
                onClick={() => onTileClick && onTileClick(cellNum)}
                className={`relative flex items-center justify-center rounded border transition-all cursor-pointer select-none overflow-hidden touch-manipulation ${bgStyle} ${
                  isCurPlayerHere ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-950 z-20' : ''
                }`}
                title={special ? `${special.name}: ${special.effectLabel}` : `Cell ${cellNum}`}
              >
                {/* Cell Number */}
                <span className="absolute top-0.5 left-0.5 sm:left-1 text-[7px] sm:text-[9px] font-bold opacity-60 leading-none">
                  {cellNum}
                </span>

                {/* Special Cell Stand Badge */}
                {special && !isGoal && (
                  <span
                    className="text-[6px] sm:text-[8px] font-bold px-0.5 rounded truncate max-w-full text-center mt-2.5 sm:mt-3"
                    style={{ color: special.colorHex }}
                  >
                    {special.standName.split(' ')[0]}
                  </span>
                )}

                {isGoal && (
                  <span className="text-[7px] sm:text-[10px] font-black text-amber-950 text-center uppercase tracking-tighter">
                    HEAVEN
                  </span>
                )}

                {/* Player Chips */}
                {playersHere.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-10">
                    {playersHere.map((p) => (
                      <div
                        key={p.id}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] shadow-md border border-white font-bold transition-transform transform active:scale-125"
                        style={{ backgroundColor: p.character.hexColor }}
                        title={`${p.name} (${p.character.stand})`}
                      >
                        {p.character.badgeSymbol}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
