'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressTracker from '@/components/ProgressTracker';
import GenerateButton from '@/components/GenerateButton';
import { POLL_INTERVAL_MS } from '@/lib/config';
import type { ResolutionPreset, StylePreset } from '@/lib/config';

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = 'idle' | 'loading' | 'processing' | 'completed' | 'error';

interface StatusResponse {
  jobId: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

interface ProductPreset {
  name: string;
  tagline: string;
  domain: string;
  category: 'devtools' | 'ai' | 'fintech' | 'cloud';
  metric: string;
  context: string;
  tag: string;
}

const SAAS_PRESETS: ProductPreset[] = [
  {
    name: 'Linear',
    tagline: 'Streamlined issue tracking built for high-performance engineering teams.',
    domain: 'linear.app',
    category: 'devtools',
    metric: '+340% Velocity',
    context: 'vs legacy trackers',
    tag: 'Issue Tracking',
  },
  {
    name: 'Cursor',
    tagline: 'Autonomous coding partner that writes and refactors at the speed of thought.',
    domain: 'cursor.com',
    category: 'ai',
    metric: '10x FASTER',
    context: 'vs manual typing',
    tag: 'AI Code Editor',
  },
  {
    name: 'Supabase',
    tagline: 'The open-source backend with sub-millisecond Postgres and instant Edge APIs.',
    domain: 'supabase.com',
    category: 'cloud',
    metric: '< 12ms Latency',
    context: 'global edge routing',
    tag: 'Cloud Backend',
  },
  {
    name: 'Raycast',
    tagline: 'Ultra-fast desktop launcher engineered with instant keyboard shortcuts.',
    domain: 'raycast.com',
    category: 'devtools',
    metric: 'Zero Latency',
    context: 'instant keystrokes',
    tag: 'macOS Launcher',
  },
  {
    name: 'Resend',
    tagline: 'The modern email API and component platform built for React teams.',
    domain: 'resend.com',
    category: 'devtools',
    metric: '99.99%',
    context: 'inbox delivery rate',
    tag: 'Email API',
  },
];

const CATEGORIES = [
  { id: 'devtools', label: 'DevTools & CLI', swatch: '#38bdf8' },
  { id: 'ai', label: 'AI & Agents', swatch: '#818cf8' },
  { id: 'cloud', label: 'Cloud & Infra', swatch: '#34d399' },
  { id: 'fintech', label: 'Fintech & SaaS', swatch: '#f59e0b' },
] as const;

const RESOLUTIONS: { value: ResolutionPreset; label: string; desc: string }[] = [
  { value: 'landscape', label: '16:9', desc: 'Landscape' },
  { value: 'vertical', label: '9:16', desc: 'Portrait / Reels' },
];

const STYLES: { value: StylePreset; label: string; desc: string }[] = [
  { value: 'cinematic', label: 'Cinematic', desc: 'Deep Violet' },
  { value: 'minimal', label: 'Minimal', desc: 'Obsidian Mono' },
  { value: 'corporate', label: 'Enterprise', desc: 'Midnight Navy' },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function HomePage() {
  // Form State
  const [productName, setProductName] = useState('Cursor');
  const [tagline, setTagline] = useState('Autonomous coding partner that writes and refactors at the speed of thought.');
  const [domain, setDomain] = useState('cursor.com');
  const [category, setCategory] = useState<'devtools' | 'ai' | 'fintech' | 'cloud'>('ai');
  const [metric, setMetric] = useState('10x FASTER');
  const [metricContext, setMetricContext] = useState('vs manual typing');

  // Video Format (Fixed to 10s, No Sound)
  const [resolution, setResolution] = useState<ResolutionPreset>('landscape');
  const [style, setStyle] = useState<StylePreset>('cinematic');

  // Job state
  const [appState, setAppState] = useState<AppState>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState('queued');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Polling ─────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/status/${id}`);
          if (!res.ok) throw new Error('Status check failed');

          const data: StatusResponse = await res.json();
          setJobStatus(data.status);
          setProgress(data.progress);

          if (data.status === 'completed' && data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
            setAppState('completed');
            stopPolling();
          } else if (data.status === 'error') {
            setError(data.error || 'Unknown error occurred');
            setAppState('error');
            stopPolling();
          }
        } catch {
          console.warn('Polling error, retrying...');
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ─── Generate Handler ────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!productName.trim() || !tagline.trim() || appState === 'loading') return;

    const formattedPrompt = `${productName.trim()} (${category}): ${tagline.trim()}. Domain: ${domain.trim()}. Key metric: ${metric.trim()} ${metricContext.trim()}`;

    setAppState('loading');
    setError(null);
    setDownloadUrl(null);
    setProgress(0);
    setJobStatus('queued');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formattedPrompt,
          options: {
            duration: '10s', // Fixed 10s video
            resolution,
            style,
            audio: 'none', // Sound removed as requested
          },
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error || 'Rate limit exceeded');
        setAppState('error');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to start generation');
      }

      const data = await res.json();
      setJobId(data.jobId);
      setAppState('processing');
      startPolling(data.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setAppState('error');
    }
  };

  // ─── Preset Click Handler ────────────────────────────────────────────────

  const applyPreset = (preset: ProductPreset) => {
    setProductName(preset.name);
    setTagline(preset.tagline);
    setDomain(preset.domain);
    setCategory(preset.category);
    setMetric(preset.metric);
    setMetricContext(preset.context);
  };

  // ─── Reset Handler ──────────────────────────────────────────────────────

  const handleReset = () => {
    stopPolling();
    setAppState('idle');
    setJobId(null);
    setJobStatus('queued');
    setProgress(0);
    setDownloadUrl(null);
    setError(null);
  };

  // ─── Download Handler ────────────────────────────────────────────────────

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${productName.toLowerCase().replace(/\s+/g, '-')}-launch.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="relative flex-1 flex flex-col min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Background Architectural Accents */}
      <div className="bg-glow" />
      <div className="bg-grid" />

      {/* Top Application Bar */}
      <header className="relative z-20 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo & Version */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight text-white truncate">
              Motionify Studio
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-400">
              v2.4 Pro
            </span>
          </div>

          {/* Engine Status */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-[11px] font-mono text-zinc-400 hidden xs:inline">Remotion 4.0</span>
            </div>
            <span className="text-white/[0.1] hidden sm:inline">|</span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">10s · 1080p 60fps</span>
          </div>
        </div>
      </header>

      {/* Main Studio Content Area */}
      <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STATE: Idle, Loading, or Error */}
          {(appState === 'idle' || appState === 'loading' || appState === 'error') && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 w-full"
            >
              {/* Studio Intro Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-zinc-300 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>SaaS Commercial Studio</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Generate launch videos in few seconds.
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                  Enter your product info and metric. Remotion renders 3D perspective app frames and kinetic typography at 60fps.
                </p>
              </div>

              {/* Company Preset Selector */}
              <div className="space-y-2 max-w-full">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-medium">
                  <span>1-Click Brand Presets</span>
                  <span className="text-zinc-500 hidden sm:inline">Click to pre-fill inputs</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full -mx-1 px-1">
                  {SAAS_PRESETS.map((p) => {
                    const isSelected = productName.toLowerCase() === p.name.toLowerCase();
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => applyPreset(p)}
                        disabled={appState === 'loading'}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium shrink-0
                          transition-all duration-150 cursor-pointer flex items-center gap-2 border
                          ${
                            isSelected
                              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold shadow-sm'
                              : 'bg-zinc-900/60 text-zinc-400 border-white/[0.06] hover:bg-zinc-800/80 hover:text-zinc-200 hover:border-white/[0.12]'
                          }
                          disabled:opacity-40 disabled:cursor-not-allowed
                        `}
                      >
                        <span>{p.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                          {p.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Studio Input Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-white/[0.08] shadow-xl space-y-4">
                {/* Section 1: Brand Identity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-white/[0.06]">
                    <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      01 / Brand Identity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Acme Cloud"
                        disabled={appState === 'loading'}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 text-zinc-100 border border-white/[0.08] focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors placeholder:text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        CTA Domain / URL
                      </label>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g. acme.dev"
                        disabled={appState === 'loading'}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 text-zinc-100 border border-white/[0.08] focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Positioning Statement / Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. The modern standard for high-performance software teams."
                      disabled={appState === 'loading'}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 text-zinc-100 border border-white/[0.08] focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors placeholder:text-zinc-600 resize-none"
                    />
                  </div>
                </div>

                {/* Section 2: Metric Proof */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-white/[0.06]">
                    <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      02 / Key Metric Proof (Act 2)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Hero Metric
                      </label>
                      <input
                        type="text"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value)}
                        placeholder="e.g. +340% Velocity, < 12ms"
                        disabled={appState === 'loading'}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 text-zinc-100 border border-white/[0.08] focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors placeholder:text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Comparison Context
                      </label>
                      <input
                        type="text"
                        value={metricContext}
                        onChange={(e) => setMetricContext(e.target.value)}
                        placeholder="e.g. vs manual typing"
                        disabled={appState === 'loading'}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950/80 text-zinc-100 border border-white/[0.08] focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Category */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                    <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      03 / Industry Category
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        disabled={appState === 'loading'}
                        className={`
                          px-2.5 py-2 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer flex items-center gap-2
                          ${
                            category === cat.id
                              ? 'bg-zinc-800 text-white border-white/20 shadow-sm'
                              : 'bg-zinc-950/50 text-zinc-400 border-white/[0.06] hover:bg-zinc-800/60 hover:text-zinc-200'
                          }
                        `}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.swatch }}
                        />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 4: Format & Style Specs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                    <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      04 / Visual Format & Palette
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">10s Standard</span>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1.5 sm:gap-3">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-20 shrink-0">
                      Ratio
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {RESOLUTIONS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setResolution(r.value)}
                          disabled={appState === 'loading'}
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5
                            ${
                              resolution === r.value
                                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                                : 'bg-zinc-800/60 text-zinc-300 border border-white/[0.06] hover:bg-zinc-800 hover:text-white'
                            }
                          `}
                        >
                          <span>{r.label}</span>
                          <span className={`text-[10px] ${resolution === r.value ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            {r.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Palette Style */}
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1.5 sm:gap-3">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-20 shrink-0">
                      Style
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {STYLES.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setStyle(s.value)}
                          disabled={appState === 'loading'}
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5
                            ${
                              style === s.value
                                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                                : 'bg-zinc-800/60 text-zinc-300 border border-white/[0.06] hover:bg-zinc-800 hover:text-white'
                            }
                          `}
                        >
                          <span>{s.label}</span>
                          <span className={`text-[10px] ${style === s.value ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            {s.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Render Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-zinc-500 hidden sm:block">
                  <span>10-second commercial · 1080p 60fps Remotion output</span>
                </div>
                <div className="w-full sm:w-auto">
                  <GenerateButton
                    onClick={handleGenerate}
                    loading={appState === 'loading'}
                    disabled={!productName.trim() || !tagline.trim()}
                  />
                </div>
              </div>

              {/* Error Notification */}
              {appState === 'error' && error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STATE: Processing (NO PREVIEW shown until fully rendered!) */}
          {appState === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto space-y-6"
            >
              <div className="text-center space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                  Rendering Commercial
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Producing {productName} Launch Video
                </h2>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {tagline}
                </p>
              </div>

              {/* Clean pipeline progress tracker only - zero lag */}
              <ProgressTracker
                status={jobStatus}
                progress={progress}
                error={error || undefined}
              />
            </motion.div>
          )}

          {/* STATE: Completed (Full, Silky Smooth Hardware Accelerated Video Playback) */}
          {appState === 'completed' && downloadUrl && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto space-y-6"
            >
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {productName} Commercial Ready
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Rendered in full 1080p 60fps. Zero dropped frames.
                </p>
              </div>

              {/* Native High-Performance HTML5 Video Player */}
              <div
                className={`
                  relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl mx-auto w-full
                  ${resolution === 'vertical' ? 'max-w-[320px] aspect-[9/16]' : 'max-w-2xl aspect-[16/9]'}
                `}
              >
                <video
                  src={downloadUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/60"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Video (MP4)</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.14] transition-all duration-150 font-medium cursor-pointer text-xs"
                >
                  Create Another Video
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
