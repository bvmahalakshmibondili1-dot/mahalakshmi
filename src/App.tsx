/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-pink-500/30">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.1)_0%,transparent_60%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.15)_0%,transparent_50%)] blur-[60px] opacity-80" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen p-6 gap-12 max-w-7xl mx-auto">
        
        {/* Left Column: Title & Music Player */}
        <div className="flex flex-col items-center lg:items-start gap-8 w-full lg:w-1/3">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              SYNTH<br/>SNAKE
            </h1>
            <p className="text-cyan-400/70 font-mono text-sm uppercase tracking-[0.2em]">
              Interactive Audio Experience
            </p>
          </div>
          
          <MusicPlayer />
        </div>

        {/* Right Column: Game */}
        <div className="flex-1 flex justify-center items-center w-full">
          <div className="p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
            <SnakeGame />
          </div>
        </div>

      </div>
    </div>
  );
}
