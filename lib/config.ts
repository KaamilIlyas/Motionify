// ─── Motionify Configuration ─────────────────────────────────────────────────

/** Maximum concurrent Remotion renders */
export const MAX_CONCURRENT_RENDERS = 3;

/** Rate limit: max generations per window per IP */
export const RATE_LIMIT_MAX = 5;

/** Rate limit window in milliseconds (1 hour) */
export const RATE_LIMIT_WINDOW_MS = 3_600_000;

/** Auto-cleanup temp files after this many ms (1 hour) */
export const CLEANUP_AFTER_MS = 3_600_000;

/** Cleanup check interval (every 5 minutes) */
export const CLEANUP_INTERVAL_MS = 300_000;

/** Frontend polling interval in ms */
export const POLL_INTERVAL_MS = 2_000;

/** Temp directory base path for renders */
export const RENDER_BASE_DIR = '/tmp/motionify';

// ─── Video Presets ───────────────────────────────────────────────────────────

export const DURATION_PRESETS = {
  '5s': { seconds: 5, frames: 150 },
  '10s': { seconds: 10, frames: 300 },
  '30s': { seconds: 30, frames: 900 },
} as const;

export type DurationPreset = keyof typeof DURATION_PRESETS;

export const RESOLUTION_PRESETS = {
  landscape: { width: 1920, height: 1080, label: 'Landscape (16:9)' },
  vertical: { width: 1080, height: 1920, label: 'Vertical (9:16)' },
} as const;

export type ResolutionPreset = keyof typeof RESOLUTION_PRESETS;

export const STYLE_PRESETS = ['cinematic', 'minimal', 'corporate'] as const;
export type StylePreset = (typeof STYLE_PRESETS)[number];

export const AUDIO_PRESETS = {
  auto: { label: 'Auto (Style Matched)' },
  'cinematic-ambient': { label: 'Cinematic Ambient (Ethereal & Deep)' },
  'tech-pulse': { label: 'Tech Pulse (Modern Electronic)' },
  'minimal-warmth': { label: 'Minimal Warmth (Organic Acoustic)' },
  none: { label: 'Mute (No Audio)' },
} as const;

export type AudioPreset = keyof typeof AUDIO_PRESETS;

/** Default video settings */
export const DEFAULT_OPTIONS = {
  duration: '10s' as DurationPreset,
  resolution: 'landscape' as ResolutionPreset,
  style: 'cinematic' as StylePreset,
  audio: 'auto' as AudioPreset,
};

/** FPS for all renders */
export const VIDEO_FPS = 30;

// ─── Example Prompts ─────────────────────────────────────────────────────────

export const EXAMPLE_PROMPTS = [
  'Cursor: AI-powered code editor with autonomous agents that code at lightspeed',
  'Linear: Streamlined issue tracking and project management for modern engineering teams',
  'Supabase: The open source Firebase alternative with sub-millisecond Postgres & Edge APIs',
  'Raycast: Ultra-fast macOS launcher with instant keyboard shortcuts and AI workflows',
  'Resend: The developer-first transactional email API built for modern React teams',
];
