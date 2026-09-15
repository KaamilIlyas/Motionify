'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import StudioHeader from '@/components/StudioHeader';
import ArchetypeSelector, { ProductPreset } from '@/components/ArchetypeSelector';
import StudioMonitor from '@/components/StudioMonitor';
import GenerateButton from '@/components/GenerateButton';
import { POLL_INTERVAL_MS } from '@/lib/config';
import type { ResolutionPreset, StylePreset } from '@/lib/config';

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = 'idle' | 'loading' | 'processing' | 'completed' | 'error';
export type TemplateDesign = 'saas-window' | 'kinetic-punch' | 'mobile-showcase' | 'fintech-grid';

interface StatusResponse {
  jobId: string;
  status: string;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

const BRAND_PRESETS: ProductPreset[] = [
  {
    id: 'ai-copilot',
    title: 'AI Copilot',
    visualStyle: '3D Web Window',
    design: 'saas-window',
    name: 'Nova AI',
    domain: 'nova.ai',
    tagline: 'Intelligent pair partner that writes and executes code at the speed of thought.',
    metric: '10x FASTER',
    context: 'task velocity',
    accent: '#6366f1',
  },
  {
    id: 'speed-engine',
    title: 'Speed Engine',
    visualStyle: 'Kinetic Keynote',
    design: 'kinetic-punch',
    name: 'HyperFlow',
    domain: 'hyperflow.dev',
    tagline: 'Sub-millisecond build engine engineered for zero-latency execution.',
    metric: '< 14ms',
    context: 'cold start latency',
    accent: '#f59e0b',
  },
  {
    id: 'mobile-app',
    title: 'Mobile App',
    visualStyle: 'Smartphone Frame',
    design: 'mobile-showcase',
    name: 'FocusFlow',
    domain: 'focusflow.app',
    tagline: 'The mindful daily planner designed to organize your mind and daily flow.',
    metric: '2.4 hrs',
    context: 'daily time saved',
    accent: '#10b981',
  },
  {
    id: 'fintech-checkout',
    title: 'Fintech Checkout',
    visualStyle: 'Cyber Card & Ledger',
    design: 'fintech-grid',
    name: 'VoltPay',
    domain: 'voltpay.io',
    tagline: 'Autonomous global payment rails with zero-fee instant settlement.',
    metric: '$12.8M',
    context: 'daily volume settled',
    accent: '#38bdf8',
  },
];

const RESOLUTIONS: { value: ResolutionPreset; label: string; desc: string }[] = [
  { value: 'landscape', label: '16:9', desc: 'Landscape' },
  { value: 'vertical', label: '9:16', desc: 'Portrait / Reels' },
];

const STYLES: { value: StylePreset; label: string; desc: string }[] = [
  { value: 'cinematic', label: 'Cinematic', desc: 'Deep Violet' },
  { value: 'minimal', label: 'Minimal', desc: 'Obsidian Mono' },
  { value: 'corporate', label: 'Enterprise', desc: 'Cyber Navy' },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function HomePage() {
  // Preset & Form State
  const [selectedPresetId, setSelectedPresetId] = useState('ai-copilot');
  const [templateDesign, setTemplateDesign] = useState<TemplateDesign>('saas-window');
  const [productName, setProductName] = useState('Nova AI');
  const [domain, setDomain] = useState('nova.ai');
  const [tagline, setTagline] = useState('Intelligent pair partner that writes and executes code at the speed of thought.');
  const [metric, setMetric] = useState('10x FASTER');
  const [metricContext, setMetricContext] = useState('task velocity');

  // Video Format (10s fixed, no sound)
  const [resolution, setResolution] = useState<ResolutionPreset>('landscape');
  const [style, setStyle] = useState<StylePreset>('cinematic');

  // Job state
  const [appState, setAppState] = useState<AppState>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
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

      const poll = async () => {
        try {
          const res = await fetch(`/api/status/${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              setError('Job not found or expired');
              setAppState('error');
              stopPolling();
              return;
            }
            throw new Error(`Status check failed: ${res.status}`);
          }

          const data: StatusResponse = await res.json();
          setProgress(data.progress || 0);

          if (data.status === 'completed') {
            stopPolling();
            setAppState('completed');
            setDownloadUrl(data.downloadUrl || `/api/download/${id}`);
          } else if (data.status === 'error') {
            stopPolling();
            setAppState('error');
            setError(data.error || 'Video generation failed');
          }
        } catch (err) {
          console.warn('[Polling] Fetch error:', err);
        }
      };

      poll();
      pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // ─── Preset Click Handler ────────────────────────────────────────────────

  const applyPreset = (preset: ProductPreset) => {
    setSelectedPresetId(preset.id);
    setTemplateDesign(preset.design);
    setProductName(preset.name);
    setDomain(preset.domain);
    setTagline(preset.tagline);
    setMetric(preset.metric);
    setMetricContext(preset.context);
  };

  // ─── Generate Handler ────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!productName.trim() || !tagline.trim() || appState === 'loading' || appState === 'processing') return;

    const activePreset = BRAND_PRESETS.find((p) => p.id === selectedPresetId);
    const categoryLabel = activePreset ? activePreset.title : 'SaaS';
    const formattedPrompt = `${productName.trim()} (${categoryLabel}): ${tagline.trim()}. Domain: ${domain.trim()}. Key metric: ${metric.trim()} ${metricContext.trim()}`;

    setAppState('loading');
    setError(null);
    setDownloadUrl(null);
    setProgress(0);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formattedPrompt,
          options: {
            duration: '10s',
            resolution,
            style,
            templateDesign,
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
  }, [productName, tagline, appState, selectedPresetId, domain, metric, metricContext, resolution, style, templateDesign, startPolling]);

  // ─── Keyboard Shortcut ───────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  // ─── Reset Handler ──────────────────────────────────────────────────────

  const handleReset = () => {
    stopPolling();
    setAppState('idle');
    setJobId(null);
    setProgress(0);
    setDownloadUrl(null);
    setError(null);
  };

  const activePreset = BRAND_PRESETS.find((p) => p.id === selectedPresetId) || BRAND_PRESETS[0];

  return (
    <main className="relative flex-1 flex flex-col min-h-screen bg-[#07070a] text-zinc-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Subtle Architectural Backdrops */}
      <div className="bg-glow" />
      <div className="bg-grid" />

      {/* Studio Navigation Chrome */}
      <StudioHeader activeArchetypeTitle={activePreset.title} />

      {/* Main Studio Workstation Body */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1 flex flex-col">
        {/* Workstation Subtitle Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Commercial Video Workstation</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                1080P · 60FPS
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an archetype and direct an agency-grade product commercial in seconds.
            </p>
          </div>
        </div>

        {/* Dual-Pane Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start flex-1">
          {/* LEFT PANE: Director Console & Form Inputs */}
          <div className="lg:col-span-6 space-y-4">
            {/* Archetype Selector */}
            <ArchetypeSelector
              presets={BRAND_PRESETS}
              selectedPresetId={selectedPresetId}
              onSelect={applyPreset}
              disabled={appState === 'loading' || appState === 'processing'}
            />

            {/* Studio Input Parameters */}
            <div className="studio-panel rounded-2xl p-4 sm:p-5 space-y-4">
              {/* 01 / BRAND IDENTITY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                    01 / Brand Identity
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                    {activePreset.visualStyle}
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
                      placeholder="e.g. Nova AI"
                      disabled={appState === 'loading' || appState === 'processing'}
                      className="w-full px-3 py-2 rounded-xl studio-input text-xs font-medium placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Website / CTA Domain
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="e.g. nova.ai"
                      disabled={appState === 'loading' || appState === 'processing'}
                      className="w-full px-3 py-2 rounded-xl studio-input text-xs font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Value Proposition / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Intelligent pair partner that writes and executes code at the speed of thought."
                    disabled={appState === 'loading' || appState === 'processing'}
                    className="w-full px-3 py-2 rounded-xl studio-input text-xs font-medium placeholder:text-zinc-600 resize-none"
                  />
                </div>
              </div>

              {/* 02 / KEY HIGHLIGHT & STAT */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                    02 / Key Highlight & Stat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Key Highlight or Result
                    </label>
                    <input
                      type="text"
                      value={metric}
                      onChange={(e) => setMetric(e.target.value)}
                      placeholder="e.g. 10x Faster, < 14ms, $12M+ Saved"
                      disabled={appState === 'loading' || appState === 'processing'}
                      className="w-full px-3 py-2 rounded-xl studio-input text-xs font-medium placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Description / Detail
                    </label>
                    <input
                      type="text"
                      value={metricContext}
                      onChange={(e) => setMetricContext(e.target.value)}
                      placeholder="e.g. task speed, build latency"
                      disabled={appState === 'loading' || appState === 'processing'}
                      className="w-full px-3 py-2 rounded-xl studio-input text-xs font-medium placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              </div>

              {/* 03 / VIDEO SPECS & PALETTE */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                  <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                    03 / Video Format & Palette
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">10s · 60fps</span>
                </div>

                {/* Aspect Ratio */}
                <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1.5 sm:gap-3">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-16 shrink-0 font-mono">
                    Ratio
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {RESOLUTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setResolution(r.value)}
                        disabled={appState === 'loading' || appState === 'processing'}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5
                          ${
                            resolution === r.value
                              ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                              : 'bg-zinc-900/70 text-zinc-300 border border-white/[0.08] hover:bg-zinc-800 hover:text-white'
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
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-16 shrink-0 font-mono">
                    Palette
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStyle(s.value)}
                        disabled={appState === 'loading' || appState === 'processing'}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5
                          ${
                            style === s.value
                              ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                              : 'bg-zinc-900/70 text-zinc-300 border border-white/[0.08] hover:bg-zinc-800 hover:text-white'
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

              {/* Action Button Row */}
              <div className="pt-2">
                <GenerateButton
                  onClick={handleGenerate}
                  loading={appState === 'loading' || appState === 'processing'}
                  disabled={!productName.trim() || !tagline.trim()}
                />
              </div>

              {/* Error Notification */}
              {appState === 'error' && error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Studio Monitor Stage (Interactive Blueprint, Pipeline & Video Player) */}
          <div className="lg:col-span-6 lg:sticky lg:top-20">
            <StudioMonitor
              appState={appState}
              progress={progress}
              downloadUrl={downloadUrl}
              error={error}
              productName={productName}
              domain={domain}
              tagline={tagline}
              metric={metric}
              metricContext={metricContext}
              templateDesign={templateDesign}
              accentColor={activePreset.accent}
              resolution={resolution}
              onReset={handleReset}
              onRender={handleGenerate}
              canRender={Boolean(productName.trim() && tagline.trim())}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
