import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Cybernetic Pulse",
    artist: "AI Gen Alpha",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Neon Overdrive",
    artist: "AI Gen Beta",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Synthwave Dreams",
    artist: "AI Gen Gamma",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-pink-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(236,72,153,0.15)]">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-pink-400 font-bold text-lg tracking-wider uppercase drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
            {currentTrack.title}
          </h3>
          <p className="text-cyan-400/70 text-sm font-mono uppercase tracking-widest">
            {currentTrack.artist}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-cyan-500/20 flex items-center justify-center border border-cyan-500/30 animate-pulse">
          <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={prevTrack}
            className="text-cyan-400 hover:text-pink-400 transition-colors hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
          >
            <SkipBack size={24} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-black border-2 border-cyan-400 rounded-full text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]"
          >
            {isPlaying ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
          </button>
          <button 
            onClick={nextTrack}
            className="text-cyan-400 hover:text-pink-400 transition-colors hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 accent-cyan-400 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
