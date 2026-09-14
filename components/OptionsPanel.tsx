'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DurationPreset, ResolutionPreset, StylePreset, AudioPreset } from '@/lib/config';

interface OptionsPanelProps {
  duration: DurationPreset;
  resolution: ResolutionPreset;
  style: StylePreset;
  audio: AudioPreset;
  onDurationChange: (d: DurationPreset) => void;
  onResolutionChange: (r: ResolutionPreset) => void;
  onStyleChange: (s: StylePreset) => void;
  onAudioChange: (a: AudioPreset) => void;
  disabled?: boolean;
}

const DURATIONS: { value: DurationPreset; label: string; desc: string }[] = [
  { value: '5s', label: '5s', desc: 'Teaser' },
  { value: '10s', label: '10s', desc: 'Standard' },
  { value: '30s', label: '30s', desc: 'Deep Dive' },
];

const RESOLUTIONS: { value: ResolutionPreset; label: string; desc: string }[] = [
  { value: 'landscape', label: '16:9', desc: 'Landscape' },
  { value: 'vertical', label: '9:16', desc: 'Portrait / Reels' },
];

const STYLES: { value: StylePreset; label: string; desc: string }[] = [
  { value: 'cinematic', label: 'Cinematic', desc: 'Linear Violet' },
  { value: 'minimal', label: 'Minimal', desc: 'Obsidian Mono' },
  { value: 'corporate', label: 'Enterprise', desc: 'Cyber Navy' },
];

const AUDIO_TRACKS: { value: AudioPreset; label: string }[] = [
  { value: 'auto', label: 'Auto (AI Matched)' },
  { value: 'tech-pulse', label: 'Tech Pulse' },
  { value: 'cinematic-ambient', label: 'Cinematic' },
  { value: 'minimal-warmth', label: 'Warmth' },
  { value: 'none', label: 'Mute' },
];

export default function OptionsPanel({
  duration,
  resolution,
  style,
  audio,
  onDurationChange,
  onResolutionChange,
  onStyleChange,
  onAudioChange,
  disabled = false,
}: OptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="
          flex items-center justify-between w-full
          px-3.5 py-2.5 rounded-xl
          bg-white/[0.02] hover:bg-white/[0.05]
          border border-white/[0.07] hover:border-white/[0.14]
          text-xs text-zinc-400 hover:text-zinc-200
          transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed
          cursor-pointer select-none
        "
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="w-3.5 h-3.5 text-zinc-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-zinc-300">Format & Sound Settings</span>
          <span className="text-zinc-500 hidden sm:inline text-[11px]">
            &mdash; {duration} · {resolution} · {style}
          </span>
        </div>

        <div className="flex items-center gap-1 text-zinc-500 text-[11px] shrink-0">
          <span>{isOpen ? 'Collapse' : 'Customize'}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-4">
              {/* Duration */}
              <OptionRow label="Timeline">
                {DURATIONS.map((d) => (
                  <SegmentButton
                    key={d.value}
                    label={d.label}
                    secondary={d.desc}
                    active={duration === d.value}
                    onClick={() => onDurationChange(d.value)}
                    disabled={disabled}
                  />
                ))}
              </OptionRow>

              {/* Resolution */}
              <OptionRow label="Ratio">
                {RESOLUTIONS.map((r) => (
                  <SegmentButton
                    key={r.value}
                    label={r.label}
                    secondary={r.desc}
                    active={resolution === r.value}
                    onClick={() => onResolutionChange(r.value)}
                    disabled={disabled}
                  />
                ))}
              </OptionRow>

              {/* Visual Theme Style */}
              <OptionRow label="Palette">
                {STYLES.map((s) => (
                  <SegmentButton
                    key={s.value}
                    label={s.label}
                    secondary={s.desc}
                    active={style === s.value}
                    onClick={() => onStyleChange(s.value)}
                    disabled={disabled}
                  />
                ))}
              </OptionRow>

              {/* Audio Soundtrack */}
              <OptionRow label="Audio Track">
                {AUDIO_TRACKS.map((a) => (
                  <SegmentButton
                    key={a.value}
                    label={a.label}
                    active={audio === a.value}
                    onClick={() => onAudioChange(a.value)}
                    disabled={disabled}
                  />
                ))}
              </OptionRow>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1.5 sm:gap-3 w-full">
      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-20 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 w-full min-w-0">{children}</div>
    </div>
  );
}

function SegmentButton({
  label,
  secondary,
  active,
  onClick,
  disabled,
}: {
  label: string;
  secondary?: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-150 cursor-pointer select-none
        flex items-center gap-1.5
        ${
          active
            ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
            : 'bg-zinc-800/60 text-zinc-300 border border-white/[0.06] hover:bg-zinc-800 hover:text-white hover:border-white/[0.12]'
        }
        disabled:opacity-40 disabled:cursor-not-allowed
      `}
    >
      <span>{label}</span>
      {secondary && (
        <span className={`text-[10px] ${active ? 'text-zinc-600' : 'text-zinc-500'}`}>
          {secondary}
        </span>
      )}
    </button>
  );
}
