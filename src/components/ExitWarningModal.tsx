import React, { useEffect } from 'react';
import { AlertTriangle, LogOut, Shield, Swords } from 'lucide-react';
import { sound } from '../services/audio';

interface ExitWarningModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onCancel: () => void;
  currentPlayerName?: string;
}

export const ExitWarningModal: React.FC<ExitWarningModalProps> = ({
  isOpen,
  onConfirmExit,
  onCancel,
  currentPlayerName,
}) => {
  // Listen for Escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-oswald text-white animate-in fade-in duration-200"
    >
      <div className="relative bg-slate-950 border-4 border-red-600 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden text-center jojo-box-shadow">
        {/* Background Comic Halftone */}
        <div className="absolute inset-0 halftone-bg opacity-15 pointer-events-none" />

        {/* Floating Menacing Kanji */}
        <div className="absolute top-2 left-3 text-3xl font-bangers text-red-500 opacity-40 pointer-events-none animate-menacing">
          ゴゴ
        </div>
        <div
          className="absolute top-3 right-4 text-3xl font-bangers text-yellow-400 opacity-40 pointer-events-none animate-menacing"
          style={{ animationDelay: '1s' }}
        >
          ゴゴ
        </div>

        {/* Caution Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
          <AlertTriangle className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>

        {/* Title */}
        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-widest text-red-300 bg-red-950 border border-red-600 uppercase mb-2">
          Match in Progress
        </span>
        <h2
          id="exit-modal-title"
          className="font-bangers text-3xl md:text-4xl text-yellow-400 tracking-wider jojo-text-gold leading-tight mb-2"
        >
          ABANDON STAND BATTLE?
        </h2>

        {/* Warning Body */}
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Are you sure you want to exit to the main menu?
          <span className="block text-red-400 font-semibold mt-1">
            All current progress, player tile positions, and Stand Power in this match will be lost!
          </span>
        </p>

        {/* JoJo Lore Comic Callout */}
        <div className="bg-slate-900/90 border-2 border-yellow-500/60 rounded-xl p-3 mb-6 text-left relative">
          <div className="text-[10px] font-mono text-yellow-400 uppercase font-bold mb-1 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-yellow-400" />
            <span>SECRET JOESTAR TECHNIQUE</span>
          </div>
          <p className="text-xs text-slate-300 italic">
            "Running away (NIGERUNDAYO!) may be a tactical retreat, but true Stand users see their battles through to the end!"
          </p>
          {currentPlayerName && (
            <p className="text-[11px] text-yellow-300 font-bold mt-1.5">
              Current turn: {currentPlayerName}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {/* Stay & Fight (Cancel Exit) */}
          <button
            onClick={() => {
              sound.playStepHop();
              onCancel();
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bangers text-xl rounded-xl border-2 border-white shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5 fill-current" />
            <span>STAY & FIGHT</span>
          </button>

          {/* Confirm Exit */}
          <button
            onClick={() => {
              sound.playHazard();
              onConfirmExit();
            }}
            className="w-full sm:w-auto py-3 px-5 bg-red-950 hover:bg-red-900 text-red-200 hover:text-white font-bangers text-lg rounded-xl border-2 border-red-600 hover:border-red-500 shadow cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>QUIT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
