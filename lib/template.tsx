import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
  registerRoot,
  Composition,
  Audio,
  staticFile,
  Sequence,
} from 'remotion';

// Import dynamic config for headless bundler fallback
import rawConfig from './config.json';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Theme {
  bgGradient?: string;
  primary?: string;
  accent?: string;
  text?: string;
  textMuted?: string;
  glowColor?: string;
}

export interface BackgroundEffects {
  particles?: boolean;
  grid?: boolean;
  ambientGlow?: boolean;
  vignette?: boolean;
  filmGrain?: boolean;
  lightLeak?: boolean;
}

export interface TimelineElement {
  id: string;
  type: string;
  startFrame: number;
  endFrame: number;
  [key: string]: any;
}

export interface BrandConfig {
  name: string;
  categoryBadge?: string;
  tagline?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface Act1Hook {
  headline: string;
  subheadline?: string;
}

export interface Act2Product {
  windowTitle?: string;
  metric?: {
    label: string;
    value: string;
    change?: string;
  };
  features?: string[];
  codeSnippet?: string;
}

export interface Act3Climax {
  headline?: string;
  badge?: string;
}

export interface VideoConfig {
  style?: 'cinematic' | 'minimal' | 'corporate';
  audioTrack?: string;
  enableSfx?: boolean;
  theme?: Theme;
  backgroundEffects?: BackgroundEffects;
  brand?: BrandConfig;
  act1_hook?: Act1Hook;
  act2_product?: Act2Product;
  act3_climax?: Act3Climax;
  elements?: any[];
}

export const THEMES: Record<string, Theme> = {
  cinematic: {
    bgGradient: '#06040d',
    primary: '#6366f1',
    accent: '#a855f7',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    glowColor: '#6366f1',
  },
  corporate: {
    bgGradient: '#030712',
    primary: '#38bdf8',
    accent: '#818cf8',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    glowColor: '#38bdf8',
  },
  minimal: {
    bgGradient: '#09090b',
    primary: '#818cf8',
    accent: '#c084fc',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.65)',
    glowColor: '#818cf8',
  },
};

export interface ConfigContextValue {
  config: VideoConfig;
  theme: Theme;
  stylePreset: 'cinematic' | 'minimal' | 'corporate';
  resolveColor: (val: string | undefined) => string;
}

const fallbackConfig = rawConfig as VideoConfig;
const fallbackStyle = fallbackConfig.style || 'cinematic';
const fallbackTheme: Theme = {
  ...THEMES[fallbackStyle],
  ...fallbackConfig.theme,
};

const defaultContextValue: ConfigContextValue = {
  config: fallbackConfig,
  theme: fallbackTheme,
  stylePreset: fallbackStyle,
  resolveColor: (val) => {
    if (!val) return 'transparent';
    if (val === 'primary' || val === 'theme.primary') return fallbackTheme.primary || '#ffffff';
    if (val === 'accent' || val === 'theme.accent') return fallbackTheme.accent || '#ffffff';
    if (val === 'text' || val === 'theme.text') return fallbackTheme.text || '#ffffff';
    if (val === 'textMuted' || val === 'theme.textMuted') return fallbackTheme.textMuted || '#ffffff';
    return val;
  },
};

export const VideoConfigContext = React.createContext<ConfigContextValue>(defaultContextValue);
export const useVideoConfigContext = () => React.useContext(VideoConfigContext);

// ─── Background FX Components ───────────────────────────────────────────────

const AmbientGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { theme } = useVideoConfigContext();
  const pulse = Math.sin(frame * 0.04) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.primary}25 0%, transparent 70%)`,
          filter: 'blur(80px)',
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          right: '15%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent}20 0%, transparent 65%)`,
          filter: 'blur(90px)',
          transform: `scale(${1.1 - pulse * 0.1})`,
        }}
      />
    </AbsoluteFill>
  );
};

const MicroGrid: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 80%)',
      }}
    />
  );
};

const FilmGrain: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

// ─── Act 1: The Provocative Hook ────────────────────────────────────────────

const Act1HookView: React.FC<{
  hook: Act1Hook;
  brand?: BrandConfig;
  actEnd: number;
}> = ({ hook, brand, actEnd }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideoConfigContext();

  if (frame > actEnd) return null;

  const springBadge = spring({
    frame: frame - 6,
    fps,
    config: { mass: 0.5, damping: 12, stiffness: 120 },
  });

  const springHeadline = spring({
    frame: frame - 14,
    fps,
    config: { mass: 0.7, damping: 14, stiffness: 95 },
  });

  const springSub = spring({
    frame: frame - 24,
    fps,
    config: { mass: 0.6, damping: 13, stiffness: 100 },
  });

  const exitOpacity = interpolate(frame, [actEnd - 12, actEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitSlide = interpolate(frame, [actEnd - 12, actEnd], [0, -40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 80px',
        opacity: exitOpacity,
        transform: `translateY(${exitSlide}px)`,
      }}
    >
      {/* Category Tag Badge */}
      {brand?.categoryBadge && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 20px',
            borderRadius: 100,
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.primary}50`,
            backdropFilter: 'blur(12px)',
            marginBottom: 28,
            boxShadow: `0 0 20px ${theme.primary}25`,
            transform: `scale(${Math.max(0, springBadge)})`,
            opacity: Math.min(1, springBadge),
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.primary,
              boxShadow: `0 0 10px ${theme.primary}`,
            }}
          />
          <span
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '2px',
              color: theme.primary,
              textTransform: 'uppercase',
            }}
          >
            {brand.categoryBadge}
          </span>
        </div>
      )}

      {/* Massive Provocative Headline */}
      <h1
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          maxWidth: 1100,
          margin: 0,
          background: `linear-gradient(135deg, #ffffff 45%, ${theme.primary} 90%, ${theme.accent} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transform: `scale(${Math.max(0.85, springHeadline)}) translateY(${(1 - Math.max(0, springHeadline)) * 30}px)`,
          opacity: Math.min(1, springHeadline),
          filter: `drop-shadow(0 4px 20px rgba(0,0,0,0.5))`,
        }}
      >
        {hook.headline}
      </h1>

      {/* Supporting Subheadline */}
      {hook.subheadline && (
        <p
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 750,
            color: theme.textMuted,
            marginTop: 24,
            transform: `translateY(${(1 - Math.max(0, springSub)) * 20}px)`,
            opacity: Math.min(1, springSub),
          }}
        >
          {hook.subheadline}
        </p>
      )}
    </AbsoluteFill>
  );
};

// ─── Act 2: The 3D Glassmorphic App Window ──────────────────────────────────

const Act2ProductView: React.FC<{
  product: Act2Product;
  brand?: BrandConfig;
  actStart: number;
  actEnd: number;
}> = ({ product, brand, actStart, actEnd }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme } = useVideoConfigContext();

  if (frame < actStart || frame > actEnd) return null;

  const actFrame = frame - actStart;

  const springWindow = spring({
    frame: actFrame,
    fps,
    config: { mass: 0.8, damping: 14, stiffness: 90 },
  });

  const exitOpacity = interpolate(frame, [actEnd - 15, actEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitScale = interpolate(frame, [actEnd - 15, actEnd], [1, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic 3D Perspective breathing
  const tiltX = 5 + Math.sin(actFrame * 0.035) * 1.5;
  const tiltY = -7 + Math.cos(actFrame * 0.04) * 2.0;

  // Metric counter animation
  const counterProgress = interpolate(actFrame, [15, 60], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1600,
        opacity: exitOpacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 1040,
          background: 'linear-gradient(135deg, rgba(22, 20, 34, 0.88), rgba(10, 8, 18, 0.94))',
          borderRadius: 22,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `0 35px 100px -15px ${theme.primary}35, 0 20px 50px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.2)`,
          backdropFilter: 'blur(28px)',
          overflow: 'hidden',
          transform: `scale(${Math.max(0.7, springWindow) * exitScale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Window Chrome Title Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* macOS traffic light buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
          </div>

          {/* Center URL pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 100,
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 13,
              color: theme.textMuted,
            }}
          >
            <span style={{ fontSize: 11, color: theme.primary }}>🔒</span>
            <span>https://{brand?.ctaUrl || 'app.cloud/dashboard'}</span>
          </div>

          {/* Right Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: '#34d399',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            <span>CONNECTED</span>
          </div>
        </div>

        {/* Window Content Area */}
        <div style={{ padding: '36px 36px 32px' }}>
          {/* Top Row: Metric Highlight & Features */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, marginBottom: 24 }}>
            {/* Left: Hero Metric Card */}
            <div
              style={{
                padding: '28px',
                borderRadius: 18,
                background: 'rgba(255, 255, 255, 0.035)',
                border: `1px solid ${theme.primary}30`,
                boxShadow: `0 10px 30px ${theme.primary}15`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    color: theme.primary,
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  {product.metric?.label || 'DEPLOYMENT VELOCITY'}
                </div>
                <div
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 64,
                    fontWeight: 800,
                    letterSpacing: '-2px',
                    color: '#ffffff',
                    lineHeight: 1,
                  }}
                >
                  {counterProgress < 0.95 ? `${Math.round(counterProgress * 340)}%` : (product.metric?.value || '+340%')}
                </div>
              </div>

              {/* Mini Sparkline Graph */}
              <div style={{ marginTop: 20 }}>
                <svg width="100%" height="45" viewBox="0 0 300 45" fill="none">
                  <path
                    d="M 0 38 Q 60 30, 120 22 T 240 10 T 300 4"
                    stroke={theme.primary}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="400"
                    strokeDashoffset={interpolate(counterProgress, [0, 1], [400, 0])}
                  />
                  <path
                    d="M 0 38 Q 60 30, 120 22 T 240 10 T 300 4 L 300 45 L 0 45 Z"
                    fill={`url(#metricGradient)`}
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.primary} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
                {product.metric?.change && (
                  <div
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#34d399',
                      marginTop: 6,
                    }}
                  >
                    ↑ {product.metric.change}
                  </div>
                )}
              </div>
            </div>

            {/* Right: 3 Animated Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
              {(product.features || ['Instant Edge Sync', 'Sub-Millisecond Engine', 'Autonomous Failover']).map(
                (feat, idx) => {
                  const featSpring = spring({
                    frame: actFrame - 18 - idx * 14,
                    fps,
                    config: { mass: 0.5, damping: 12, stiffness: 120 },
                  });

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 20px',
                        borderRadius: 14,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transform: `translateX(${(1 - Math.max(0, featSpring)) * 30}px)`,
                        opacity: Math.min(1, featSpring),
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: `${theme.primary}25`,
                          border: `1px solid ${theme.primary}60`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.primary,
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </div>
                      <span
                        style={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#ffffff',
                        }}
                      >
                        {feat}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Bottom Code / Status Bar */}
          {product.codeSnippet && (
            <div
              style={{
                padding: '14px 20px',
                borderRadius: 12,
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'monospace',
                fontSize: 13,
                color: theme.textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ color: theme.primary }}>$ </span>
                <span style={{ color: '#ffffff' }}>{product.codeSnippet.split('\n')[0]}</span>
              </div>
              <div style={{ fontSize: 11, color: '#34d399' }}>✓ OK</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Act 3: Grand Brand Reveal & Climax CTA ─────────────────────────────────

const Act3ClimaxView: React.FC<{
  brand?: BrandConfig;
  climax?: Act3Climax;
  actStart: number;
}> = ({ brand, climax, actStart }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { theme } = useVideoConfigContext();

  if (frame < actStart) return null;

  const actFrame = frame - actStart;

  const springBadge = spring({
    frame: actFrame,
    fps,
    config: { mass: 0.5, damping: 12, stiffness: 120 },
  });

  const springTitle = spring({
    frame: actFrame - 8,
    fps,
    config: { mass: 0.7, damping: 13, stiffness: 95 },
  });

  const springCta = spring({
    frame: actFrame - 18,
    fps,
    config: { mass: 0.6, damping: 13, stiffness: 105 },
  });

  // Slow continuous camera zoom
  const cameraZoom = interpolate(actFrame, [0, durationInFrames - actStart], [0.96, 1.04], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 80px',
        transform: `scale(${cameraZoom})`,
      }}
    >
      {/* Live Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 22px',
          borderRadius: 100,
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${theme.primary}50`,
          backdropFilter: 'blur(12px)',
          marginBottom: 32,
          boxShadow: `0 0 25px ${theme.primary}30`,
          transform: `scale(${Math.max(0, springBadge)})`,
          opacity: Math.min(1, springBadge),
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 10px #22c55e',
          }}
        />
        <span
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '2.5px',
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          {climax?.badge || 'NOW LIVE WORLDWIDE'}
        </span>
      </div>

      {/* Massive Brand Name */}
      <h1
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 108,
          fontWeight: 900,
          letterSpacing: '-2px',
          margin: '0 0 20px 0',
          background: `linear-gradient(135deg, #ffffff 40%, ${theme.primary} 90%, ${theme.accent} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transform: `scale(${Math.max(0.85, springTitle)})`,
          opacity: Math.min(1, springTitle),
          filter: `drop-shadow(0 0 45px ${theme.primary}60)`,
        }}
      >
        {brand?.name || 'MOTIONIFY'}
      </h1>

      {/* Tagline */}
      {brand?.tagline && (
        <p
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.4,
            maxWidth: 780,
            color: 'rgba(255, 255, 255, 0.82)',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            margin: '0 0 44px 0',
            opacity: Math.min(1, springTitle),
          }}
        >
          {brand.tagline}
        </p>
      )}

      {/* Call to Action Pill Button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          transform: `translateY(${(1 - Math.max(0, springCta)) * 25}px)`,
          opacity: Math.min(1, springCta),
        }}
      >
        <div
          style={{
            padding: '18px 44px',
            borderRadius: 100,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            color: '#ffffff',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.5px',
            boxShadow: `0 15px 40px -10px ${theme.primary}80, inset 0 1px 1px rgba(255,255,255,0.4)`,
          }}
        >
          {brand?.ctaText || 'Get Started Free →'}
        </div>

        {brand?.ctaUrl && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.60)',
              letterSpacing: '1.5px',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {brand.ctaUrl}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ─── Sound Design Engine ────────────────────────────────────────────────────

const SoundDesignLayer: React.FC<{
  act2Start: number;
  act3Start: number;
  maxEndFrame: number;
}> = ({ act2Start, act3Start, maxEndFrame }) => {
  const { config, stylePreset } = useVideoConfigContext();
  const isSfxEnabled = config.enableSfx !== false && stylePreset !== 'minimal';

  const resolvedAudioTrack =
    config.audioTrack === 'none'
      ? null
      : config.audioTrack ||
        (stylePreset === 'corporate'
          ? 'tech-pulse'
          : stylePreset === 'minimal'
            ? 'minimal-warmth'
            : 'tech-pulse');

  // Key visual impact and whoosh cues
  const impactFrames = [12, act2Start + 8, act3Start + 10];
  const whooshFrames = [act2Start + 22, act2Start + 38, act2Start + 54];

  return (
    <>
      {resolvedAudioTrack && (
        <Audio
          src={staticFile(`audio/${resolvedAudioTrack}.wav`)}
          volume={(f) =>
            interpolate(
              f,
              [0, 25, Math.max(30, maxEndFrame - 30), maxEndFrame],
              [0, 0.75, 0.75, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            )
          }
        />
      )}

      {isSfxEnabled && (
        <>
          {impactFrames.map((f, idx) => (
            <Sequence key={`impact-${idx}`} from={f} durationInFrames={36}>
              <Audio src={staticFile('audio/sfx-impact.wav')} volume={0.35} />
            </Sequence>
          ))}
          {whooshFrames.map((f, idx) => (
            <Sequence key={`whoosh-${idx}`} from={f} durationInFrames={25}>
              <Audio src={staticFile('audio/sfx-whoosh.wav')} volume={0.25} />
            </Sequence>
          ))}
        </>
      )}
    </>
  );
};

// Helper to calculate luminance of any hex color
const getHexLuminance = (hex: string | undefined): number => {
  if (!hex || typeof hex !== 'string') return 0;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  } else if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  return 0;
};

// ─── Main Video Component ───────────────────────────────────────────────────

export const RemotionVideo: React.FC<{ config?: VideoConfig }> = ({ config: propConfig }) => {
  const activeConfig = propConfig || fallbackConfig;
  const stylePreset = activeConfig.style || 'cinematic';
  
  // Intelligent Contrast & Dark Theme Enforcement
  // 1. Force background to stay pitch-black / ultra-dark (never white or light)
  const rawBg = (activeConfig.theme?.bgGradient || THEMES[stylePreset]?.bgGradient || '#06040d').trim();
  const isLightBg =
    getHexLuminance(rawBg) > 0.25 ||
    rawBg.toLowerCase().includes('fff') ||
    rawBg.toLowerCase() === 'white' ||
    rawBg.toLowerCase().includes('rgb(255');
  const safeBg = isLightBg ? '#06040d' : rawBg;

  // 2. Ensure primary color has sufficient color saturation and isn't washed out
  const rawPrimary = activeConfig.theme?.primary || THEMES[stylePreset]?.primary || '#6366f1';
  const isWashedOutPrimary = getHexLuminance(rawPrimary) > 0.80 || getHexLuminance(rawPrimary) < 0.15;
  const safePrimary = isWashedOutPrimary ? '#818cf8' : rawPrimary;

  const rawAccent = activeConfig.theme?.accent || THEMES[stylePreset]?.accent || '#a855f7';
  const isWashedOutAccent = getHexLuminance(rawAccent) > 0.85 || getHexLuminance(rawAccent) < 0.15;
  const safeAccent = isWashedOutAccent ? '#c084fc' : rawAccent;

  const theme: Theme = {
    ...THEMES[stylePreset],
    ...activeConfig.theme,
    bgGradient: safeBg,
    primary: safePrimary,
    accent: safeAccent,
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.65)',
    glowColor: safePrimary,
  };

  const resolveColor = (val: string | undefined): string => {
    if (!val) return 'transparent';
    if (val === 'primary' || val === 'theme.primary') return theme.primary || '#ffffff';
    if (val === 'accent' || val === 'theme.accent') return theme.accent || '#ffffff';
    if (val === 'text' || val === 'theme.text') return theme.text || '#ffffff';
    if (val === 'textMuted' || val === 'theme.textMuted') return theme.textMuted || '#ffffff';
    return val;
  };

  const contextValue: ConfigContextValue = {
    config: activeConfig,
    theme,
    stylePreset,
    resolveColor,
  };

  const { durationInFrames } = useVideoConfig();
  const maxEndFrame = durationInFrames || 300;

  // Act timeline timings (distinct, non-overlapping acts)
  const act1End = Math.round(maxEndFrame * 0.28);
  const act2Start = Math.round(maxEndFrame * 0.30);
  const act2End = Math.round(maxEndFrame * 0.70);
  const act3Start = Math.round(maxEndFrame * 0.72);

  const hookData = activeConfig.act1_hook || {
    headline: 'Software engineered at the speed of thought.',
    subheadline: 'The modern standard for high-velocity teams.',
  };

  const productData = activeConfig.act2_product || {
    windowTitle: 'app.cloud // overview',
    metric: {
      label: 'SYSTEM THROUGHPUT',
      value: '+340%',
      change: '10x faster rollouts',
    },
    features: ['Instant Edge Routing', 'Sub-Millisecond Engine', 'Autonomous Failover'],
    codeSnippet: 'npx deploy --prod\n✓ Deployed globally in 14ms',
  };

  const climaxData = activeConfig.act3_climax || {
    headline: 'The Future of Software is Here',
    badge: 'PUBLIC BETA NOW LIVE',
  };

  return (
    <VideoConfigContext.Provider value={contextValue}>
      <AbsoluteFill
        style={{
          background: theme.bgGradient || '#06040d',
          color: theme.text,
          overflow: 'hidden',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap');
          * {
            box-sizing: border-box;
          }
        `}</style>

        {/* Background Visual Layers */}
        <AmbientGlow />
        <MicroGrid />

        {/* 3-Act SaaS Launch Presentation */}
        <Act1HookView hook={hookData} brand={activeConfig.brand} actEnd={act1End} />

        <Act2ProductView
          product={productData}
          brand={activeConfig.brand}
          actStart={act2Start}
          actEnd={act2End}
        />

        <Act3ClimaxView brand={activeConfig.brand} climax={climaxData} actStart={act3Start} />

        {/* Post-Processing Texture */}
        <FilmGrain />
      </AbsoluteFill>
    </VideoConfigContext.Provider>
  );
};

// ─── Root Composition (For Headless Bundler) ──────────────────────────────────

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RemotionVideo"
      component={RemotionVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ config: fallbackConfig }}
    />
  );
};

try {
  registerRoot(RemotionRoot);
} catch {
  // Ignored in Next.js React client/SSR where registerRoot is already called or not needed
}

export default RemotionVideo;
