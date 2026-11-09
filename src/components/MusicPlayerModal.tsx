import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, Disc3, Sparkles } from 'lucide-react';
import { sound, MUSIC_TRACKS, MusicTrack } from '../services/audio';

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({ isOpen, onClose }) => {
  const [currentTrackId, setCurrentTrackId] = useState<string>(sound.currentTrackId);
  const [isPlaying, setIsPlaying] = useState<boolean>(sound.isBgmPlaying);
  const [volume, setVolume] = useState<number>(sound.bgmVolume);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  useEffect(() => {
    // Subscribe to BGM changes from sound engine
    const unsubscribe = sound.subscribeBgm((trackId, playing) => {
      setCurrentTrackId(trackId);
      setIsPlaying(playing);
      setIsMuted(sound.isMuted);
      setVolume(sound.bgmVolume);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const currentTrack: MusicTrack =
    MUSIC_TRACKS.find((t) => t.id === currentTrackId) || MUSIC_TRACKS[0];

  const handleSelectTrack = (trackId: string) => {
    sound.playTrack(trackId);
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    const nextPlaying = sound.toggleBgm();
    setIsPlaying(nextPlaying);
  };

  const handleNextTrack = () => {
    const nextId = sound.nextTrack();
    setCurrentTrackId(nextId);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    sound.setBgmVolume(newVol);
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-950 border-4 border-yellow-500 rounded-2xl max-w-lg w-full flex flex-col overflow-hidden shadow-2xl jojo-box-gold">
        {/* Header */}
        <div className="p-3.5 md:p-4 bg-purple-950 border-b-2 border-yellow-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className={`w-5 h-5 text-yellow-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <div>
              <h2 className="font-bangers text-2xl text-yellow-400 tracking-wider leading-none">
                STAND RADIO & BGM JUKEBOX
              </h2>
              <span className="text-[10px] text-purple-300 font-mono">
                SELECT BATTLE SOUNDTRACK
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Track Banner */}
        <div
          className="p-4 border-b border-slate-800 flex items-center gap-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.themeColor}22 0%, #020617 100%)`,
          }}
        >
          {/* Animated Halftone Overlay */}
          <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

          {/* Disc / Icon Art */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-3 border-yellow-400 shadow-xl shrink-0 relative"
            style={{ backgroundColor: currentTrack.themeColor }}
          >
            {currentTrack.coverEmoji}
            {isPlaying && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-ping" />
            )}
          </div>

          {/* Current Track Details */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded uppercase text-white tracking-wider"
                style={{ backgroundColor: currentTrack.themeColor }}
              >
                {currentTrack.tag}
              </span>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-yellow-400 rounded-full animate-pulse h-2" />
                  <span className="w-1 bg-yellow-400 rounded-full animate-pulse h-3.5 delay-75" />
                  <span className="w-1 bg-yellow-400 rounded-full animate-pulse h-1.5 delay-150" />
                  <span className="w-1 bg-yellow-400 rounded-full animate-pulse h-3 delay-100" />
                </div>
              )}
            </div>

            <h3 className="font-bangers text-xl md:text-2xl text-white truncate drop-shadow">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-yellow-300 font-medium truncate mb-0.5">
              {currentTrack.subtitle}
            </p>
            <p className="text-[11px] text-slate-400 truncate font-mono">
              Artist: {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Master Playback Controls */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="p-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-grow max-w-[200px] ml-auto">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-yellow-400 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-yellow-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
            <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Track Selection List */}
        <div className="p-4 overflow-y-auto max-h-[320px] space-y-2.5 bg-slate-950">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>AVAILABLE SOUNDTRACKS</span>
            <span className="text-[10px] text-yellow-400 flex items-center gap-1 font-normal font-mono">
              <Sparkles className="w-3 h-3 text-yellow-400" /> Click to Play
            </span>
          </div>

          {MUSIC_TRACKS.map((track) => {
            const isSelected = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-950/70 border-yellow-400 shadow-lg scale-101'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/20 shadow"
                    style={{ backgroundColor: track.themeColor }}
                  >
                    {track.coverEmoji}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bangers text-base md:text-lg text-white truncate">
                        {track.title}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.2 rounded text-white shrink-0"
                        style={{ backgroundColor: track.themeColor }}
                      >
                        {track.tag}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-300 font-medium truncate">
                      {track.subtitle}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {track.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {isSelected && isPlaying ? (
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center shadow">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-colors">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="italic truncate pr-2">
            Tip: Songs seamlessly loop during high-stakes Stand clashes.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Jukebox
          </button>
        </div>
      </div>
    </div>
  );
};
