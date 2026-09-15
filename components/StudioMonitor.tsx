'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioMonitorProps {
  appState: 'idle' | 'loading' | 'processing' | 'completed' | 'error';
  progress: number;
  downloadUrl: string | null;
  error: string | null;
  productName: string;
  domain: string;
  tagline: string;
  metric: string;
  metricContext: string;
  templateDesign: 'saas-window' | 'kinetic-punch' | 'mobile-showcase' | 'fintech-grid';
  accentColor: string;
  resolution?: 'landscape' | 'vertical';
  onReset: () => void;
  onRender: () => void;
  canRender: boolean;
}

export default function StudioMonitor({
  appState,
  progress,
  downloadUrl,
  error,
  productName,
  domain,
  tagline,
  metric,
  metricContext,
  templateDesign,
  accentColor,
  resolution = 'landscape',
  onReset,
  onRender,
  canRender,
}: StudioMonitorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!downloadUrl) return;
    const fullUrl = window.location.origin + downloadUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Studio Monitor Chrome */}
      <div className="relative rounded-2xl monitor-bezel p-3 sm:p-4 flex-1 flex flex-col min-h-[380px] sm:min-h-[460px] overflow-hidden">
        {/* Dynamic Backlight Glow behind monitor */}
        <div
          className="absolute -inset-10 opacity-20 blur-3xl pointer-events-none transition-colors duration-700"
          style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}, transparent 70%)` }}
        />

        {/* Top Monitor Status Bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                appState === 'processing'
                  ? 'bg-amber-400 animate-ping'
                  : appState === 'completed'
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400 animate-pulse'
              }`}
            />
            <span className="text-zinc-300 font-semibold tracking-wider uppercase">
              {appState === 'processing'
                ? 'RENDERING IN PROGRESS'
                : appState === 'completed'
                ? 'MASTER OUTPUT READY'
                : 'INTERACTIVE STAGE PREVIEW'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-zinc-500">
            <span className="hidden sm:inline">{resolution === 'vertical' ? '1080x1920 (9:16)' : '1920x1080 (16:9)'} · 60FPS</span>
            <span className="text-zinc-300 font-semibold bg-white/[0.06] px-2 py-0.5 rounded">
              00:00:10:00
            </span>
          </div>
        </div>

        {/* Monitor Screen Viewport */}
        <div className="relative z-10 flex-1 rounded-xl bg-zinc-950/90 border border-white/[0.08] overflow-hidden flex flex-col justify-center items-center scanline-grid">
          {/* Corner Viewport Reticles [ + ] */}
          <div className="absolute top-3 left-3 text-zinc-600 font-mono text-[10px] pointer-events-none select-none">
            ┌─ [CAM 01]
          </div>
          <div className="absolute top-3 right-3 text-zinc-600 font-mono text-[10px] pointer-events-none select-none">
            [{resolution === 'vertical' ? '9:16 PORTRAIT' : '16:9 REC'}] ─┐
          </div>
          <div className="absolute bottom-3 left-3 text-zinc-600 font-mono text-[10px] pointer-events-none select-none">
            └─ H.264
          </div>
          <div className="absolute bottom-3 right-3 text-zinc-600 font-mono text-[10px] pointer-events-none select-none">
            RAW PROOF ─┘
          </div>

          {/* VIEW 1: Idle / Loading Stage Blueprint */}
          {(appState === 'idle' || appState === 'loading') && (
            <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={templateDesign}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md"
                >
                  {/* Archetype 1: 3D SaaS Browser Window */}
                  {templateDesign === 'saas-window' && (
                    <div className="rounded-xl bg-zinc-900/90 border border-white/15 p-3.5 shadow-2xl shadow-indigo-950/60 backdrop-blur-md">
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[180px]">
                          {domain || 'app.domain.com'}
                        </span>
                        <div className="w-10" />
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white tracking-tight">
                            {productName || 'Your Product'}
                          </span>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border text-white"
                            style={{ backgroundColor: `${accentColor}25`, borderColor: `${accentColor}60` }}
                          >
                            {metric || '+340% SPEED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {tagline || 'Experience the modern standard in high-velocity software engineering.'}
                        </p>
                        {/* Sparkline mini-graph */}
                        <div className="h-10 rounded-lg bg-black/50 border border-white/5 p-2 flex items-end gap-1.5">
                          {[30, 45, 40, 60, 55, 75, 70, 95].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t"
                              style={{
                                height: `${h}%`,
                                backgroundColor: i >= 5 ? accentColor : 'rgba(255,255,255,0.15)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Archetype 2: Kinetic Punch Keynote */}
                  {templateDesign === 'kinetic-punch' && (
                    <div className="rounded-xl bg-zinc-900/90 border border-white/15 p-4 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400">
                          // KINETIC TELEMETRY
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">REALTIME</span>
                      </div>
                      <div className="text-2xl font-black tracking-tight text-white uppercase italic">
                        {productName ? `${productName.toUpperCase()}` : 'SPEED ENGINE'}
                      </div>
                      <div className="p-3 rounded-lg bg-black/60 border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase">
                            {metricContext || 'BENCHMARK LATENCY'}
                          </div>
                          <div className="text-xl font-extrabold text-white font-mono">
                            {metric || '< 14ms'}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-400 animate-spin flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Archetype 3: 3D Smartphone Frame */}
                  {templateDesign === 'mobile-showcase' && (
                    <div className="w-[200px] mx-auto rounded-2xl bg-zinc-900 border-2 border-white/20 p-2.5 shadow-2xl space-y-2">
                      <div className="w-14 h-2.5 rounded-full bg-black mx-auto border border-white/10" />
                      <div className="p-2 rounded-xl bg-white/[0.07] border border-white/10 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center text-[9px] font-bold text-white">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">{metric || '2.4 hrs'}</div>
                          <div className="text-[8px] text-zinc-400 truncate">{metricContext || 'daily saved'}</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {['Deep Focus Engine', 'Autonomous Sync'].map((f, i) => (
                          <div key={i} className="px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[9px] text-zinc-300 flex items-center gap-1.5">
                            <span className="text-emerald-400 text-[8px]">●</span>
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="w-12 h-1 rounded-full bg-white/40 mx-auto mt-1" />
                    </div>
                  )}

                  {/* Archetype 4: Fintech Cyber Card */}
                  {templateDesign === 'fintech-grid' && (
                    <div className="rounded-xl bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 border border-white/20 p-4 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-5 rounded bg-amber-400/90 border border-amber-300 shadow-sm" />
                        <span className="text-[10px] font-mono text-cyan-400">))) CONTACTLESS</span>
                      </div>
                      <div className="font-mono text-sm tracking-widest text-zinc-200">
                        •••• •••• •••• 9024
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-white/10">
                        <span className="uppercase">{productName || 'VOLTPAY'}</span>
                        <span className="text-emerald-400 font-bold">{metric || '$12.8M'} SETTLED</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-zinc-500" />
                <span>Stage Blueprint Ready</span>
              </div>
            </div>
          )}

          {/* VIEW 2: Rendering in Progress */}
          {appState === 'processing' && (
            <div className="w-full max-w-sm px-6 py-8 flex flex-col items-center text-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] font-mono text-indigo-400 font-bold border border-indigo-500/30">
                  {progress}%
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white font-mono">
                  Synthesizing Commercial
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {progress < 40
                    ? '1/3 · AI Director Storyboarding'
                    : progress < 85
                    ? `2/3 · Remotion Headless Rendering (${Math.round((progress / 100) * 300)}/300 frames)`
                    : '3/3 · Encoding H.264 Master Output'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, progress)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* VIEW 3: Completed Video Player */}
          {appState === 'completed' && downloadUrl && (
            <div className="w-full h-full flex flex-col justify-center items-center bg-black">
              <video
                src={downloadUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Under-Monitor Studio Actions */}
      {appState === 'completed' && downloadUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center gap-2 pt-1"
        >
          <a
            href={downloadUrl}
            download={`${(productName || 'commercial').toLowerCase().replace(/\s+/g, '-')}.mp4`}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 hover:brightness-110 transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download 1080p MP4</span>
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? '✓ COPIED LINK' : 'SHARE LINK'}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            EDIT & NEW
          </button>
        </motion.div>
      )}
    </div>
  );
}
