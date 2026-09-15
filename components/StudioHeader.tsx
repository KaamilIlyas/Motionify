'use client';

import React from 'react';

interface StudioHeaderProps {
  activeArchetypeTitle: string;
}

export default function StudioHeader({ activeArchetypeTitle }: StudioHeaderProps) {
  return (
    <header className="w-full border-b border-white/[0.08] bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo & Brand Mark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-indigo-400">
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="2.5" />
                <path d="M10 9l6 3-6 3V9z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-sm tracking-tight text-white font-mono">MOTIONIFY</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
              STUDIO
            </span>
          </div>
        </div>

        {/* Center / Archetype Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-zinc-500">ACTIVE STAGE:</span>
          <span className="text-zinc-200 font-semibold">{activeArchetypeTitle}</span>
        </div>

        {/* Engine Telemetry & Shortcuts */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Remotion 60FPS</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
            <kbd className="text-[10px] bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">⌘</kbd>
            <kbd className="text-[10px] bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">↵</kbd>
            <span className="text-zinc-500 ml-1">Render</span>
          </div>
        </div>
      </div>
    </header>
  );
}
