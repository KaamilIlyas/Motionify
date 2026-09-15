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
  templateDesign?: 'saas-window' | 'kinetic-punch' | 'mobile-showcase' | 'fintech-grid';
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
  const { fps, width, height } = useVideoConfig();
  const { theme } = useVideoConfigContext();
  const isPortrait = height > width;

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
        padding: isPortrait ? '0 40px' : '0 80px',
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
          fontSize: isPortrait ? 48 : 72,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          maxWidth: isPortrait ? 840 : 1100,
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
            fontSize: isPortrait ? 18 : 24,
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: isPortrait ? 700 : 750,
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
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;
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
  const tiltX = (isPortrait ? 3 : 5) + Math.sin(actFrame * 0.035) * 1.5;
  const tiltY = (isPortrait ? -4 : -7) + Math.cos(actFrame * 0.04) * 2.0;

  // Metric counter animation
  const counterProgress = interpolate(actFrame, [15, 60], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const windowWidth = isPortrait ? Math.min(860, width - 80) : 1040;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1600,
        opacity: exitOpacity,
        pointerEvents: 'none',
        padding: isPortrait ? '0 36px' : '0 80px',
      }}
    >
      <div
        style={{
          width: windowWidth,
          maxWidth: '100%',
          background: 'linear-gradient(135deg, rgba(22, 20, 34, 0.88), rgba(10, 8, 18, 0.94))',
          borderRadius: 22,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `0 35px 100px -15px ${theme.primary}35, 0 20px 50px rgba(0,0,0,0.85), inset 0 1px 1px rgba(255,255,255,0.2)`,
          backdropFilter: 'blur(28px)',
          overflow: 'hidden',
          transform: `scale(${Math.max(0.7, springWindow) * exitScale * (isPortrait ? 0.95 : 1)}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Window Chrome Title Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isPortrait ? '14px 18px' : '16px 24px',
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
              maxWidth: isPortrait ? 260 : undefined,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 11, color: theme.primary }}>🔒</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              https://{brand?.ctaUrl || 'app.cloud/dashboard'}
            </span>
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
        <div style={{ padding: isPortrait ? '24px 24px 20px' : '36px 36px 32px' }}>
          {/* Top Row: Metric Highlight & Features */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isPortrait ? '1fr' : '1.2fr 1fr',
              gap: isPortrait ? 18 : 28,
              marginBottom: isPortrait ? 16 : 24,
            }}
          >
            {/* Left: Hero Metric Card */}
            <div
              style={{
                padding: isPortrait ? '20px 24px' : '28px',
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
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    color: theme.primary,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {product.metric?.label || 'DEPLOYMENT VELOCITY'}
                </div>
                <div
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: isPortrait ? 52 : 64,
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
              <div style={{ marginTop: isPortrait ? 12 : 20 }}>
                <svg width="100%" height={isPortrait ? '36' : '45'} viewBox="0 0 300 45" fill="none">
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
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#34d399',
                      marginTop: 4,
                    }}
                  >
                    ↑ {product.metric.change}
                  </div>
                )}
              </div>
            </div>

            {/* Right: 3 Animated Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isPortrait ? 8 : 12, justifyContent: 'center' }}>
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
                        gap: 12,
                        padding: isPortrait ? '12px 16px' : '16px 20px',
                        borderRadius: 14,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transform: `translateX(${(1 - Math.max(0, featSpring)) * 30}px)`,
                        opacity: Math.min(1, featSpring),
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: `${theme.primary}25`,
                          border: `1px solid ${theme.primary}60`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.primary,
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </div>
                      <span
                        style={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontSize: isPortrait ? 14 : 16,
                          fontWeight: 600,
                          color: '#ffffff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
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
                padding: isPortrait ? '10px 16px' : '14px 20px',
                borderRadius: 12,
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'monospace',
                fontSize: isPortrait ? 11 : 13,
                color: theme.textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 10 }}>
                <span style={{ color: theme.primary }}>$ </span>
                <span style={{ color: '#ffffff' }}>{product.codeSnippet.split('\n')[0]}</span>
              </div>
              <div style={{ fontSize: 11, color: '#34d399', flexShrink: 0 }}>✓ OK</div>
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
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const isPortrait = height > width;
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
        padding: isPortrait ? '0 36px' : '0 80px',
        transform: `scale(${cameraZoom})`,
      }}
    >
      {/* Live Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: isPortrait ? '6px 18px' : '8px 22px',
          borderRadius: 100,
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${theme.primary}50`,
          backdropFilter: 'blur(12px)',
          marginBottom: isPortrait ? 24 : 32,
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
            fontSize: isPortrait ? 12 : 14,
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
          fontSize: isPortrait ? 68 : 108,
          fontWeight: 900,
          letterSpacing: '-2px',
          margin: isPortrait ? '0 0 14px 0' : '0 0 20px 0',
          maxWidth: isPortrait ? 880 : 1200,
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
            fontSize: isPortrait ? 20 : 26,
            fontWeight: 500,
            lineHeight: 1.4,
            maxWidth: isPortrait ? 760 : 780,
            color: 'rgba(255, 255, 255, 0.82)',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            margin: isPortrait ? '0 0 32px 0' : '0 0 44px 0',
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
            padding: isPortrait ? '15px 36px' : '18px 44px',
            borderRadius: 100,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            color: '#ffffff',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: isPortrait ? 16 : 18,
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
              fontSize: isPortrait ? 12 : 14,
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

// ══════════════════════════════════════════════════════════════════════════════
// ARCHETYPE 2: Kinetic Typographic Punch (Apple Keynote / Speed Promo)
// ══════════════════════════════════════════════════════════════════════════════

const KineticPunchPresentation: React.FC<{
  hook: Act1Hook;
  product: Act2Product;
  climax: Act3Climax;
  brand?: BrandConfig;
  act1End: number;
  act2Start: number;
  act2End: number;
  act3Start: number;
  maxEndFrame: number;
  theme: Theme;
}> = ({ hook, product, climax, brand, act1End, act2Start, act2End, act3Start, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  // ACT 1: Kinetic Rapid Text Flash & Hook
  if (frame <= act1End) {
    const isFlashPhase = frame < 36;
    const flashWord = frame < 18 ? 'EXECUTE.' : 'ZERO FRICTION.';
    const springWord = spring({ frame: frame % 18, fps, config: { mass: 0.4, stiffness: 240, damping: 14 } });
    const springHook = spring({ frame: frame - 38, fps, config: { mass: 0.6, stiffness: 120, damping: 14 } });
    const laserX = interpolate(frame, [0, act1End], [-100, 200], { extrapolateRight: 'clamp' });

    return (
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isPortrait ? '0 36px' : '0 80px' }}>
        <div style={{ position: 'absolute', top: '50%', left: `${laserX}%`, width: 320, height: 2, background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`, boxShadow: `0 0 25px ${theme.primary}`, transform: 'translateY(-50%)' }} />

        {isFlashPhase ? (
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 78 : 104, fontWeight: 900, letterSpacing: '-3px', color: '#ffffff', textTransform: 'uppercase', transform: `scale(${Math.max(0.7, springWord)})`, textShadow: `0 0 40px ${theme.primary}` }}>
            {flashWord}
          </h1>
        ) : (
          <div style={{ opacity: Math.min(1, springHook), transform: `translateY(${(1 - Math.max(0, springHook)) * 30}px)` }}>
            <div style={{ display: 'inline-flex', padding: isPortrait ? '6px 16px' : '6px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.primary}50`, color: theme.primary, fontSize: isPortrait ? 12 : 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: isPortrait ? 20 : 24 }}>
              {brand?.categoryBadge || '// HIGH-VELOCITY RUNTIME'}
            </div>
            <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 58 : 72, fontWeight: 900, letterSpacing: '-2px', color: '#ffffff', lineHeight: 1.15, maxWidth: isPortrait ? 900 : 1050, margin: '0 auto', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.8))' }}>
              {hook.headline}
            </h1>
          </div>
        )}
      </AbsoluteFill>
    );
  }

  // ACT 2: Split-Screen Holographic Radar & High-Speed Metric Cards
  if (frame >= act2Start && frame <= act2End) {
    const actFrame = frame - act2Start;
    const springCard = spring({ frame: actFrame, fps, config: { mass: 0.7, stiffness: 100, damping: 14 } });
    const pulseRadar = Math.sin(actFrame * 0.12) * 0.15 + 1;
    const progressWidth = interpolate(actFrame, [10, 60], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const radarSize = isPortrait ? 180 : 220;

    return (
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isPortrait ? '0 36px' : '0 80px' }}>
        <div style={{ width: isPortrait ? Math.min(880, width - 60) : 1120, maxWidth: '100%', display: 'flex', flexDirection: isPortrait ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isPortrait ? 24 : 36, opacity: Math.min(1, springCard), transform: `scale(${Math.max(0.85, springCard)})` }}>
          {/* Left: Holographic Radar Core */}
          <div style={{ width: isPortrait ? '100%' : 'auto', maxWidth: isPortrait ? 720 : undefined, flex: isPortrait ? 'none' : 1, padding: isPortrait ? '26px 28px' : 40, borderRadius: 24, background: 'rgba(12, 10, 20, 0.85)', border: `1px solid ${theme.primary}40`, boxShadow: `0 20px 60px ${theme.primary}20, inset 0 1px 1px rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: radarSize, height: radarSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: radarSize, height: radarSize, borderRadius: '50%', border: `1px dashed ${theme.primary}60`, transform: `scale(${pulseRadar})` }} />
              <div style={{ position: 'absolute', width: isPortrait ? 130 : 160, height: isPortrait ? 130 : 160, borderRadius: '50%', border: `1px solid ${theme.accent}70` }} />
              <div style={{ position: 'absolute', width: isPortrait ? 85 : 100, height: isPortrait ? 85 : 100, borderRadius: '50%', background: `radial-gradient(circle, ${theme.primary}40 0%, transparent 70%)` }} />
              <span style={{ fontFamily: 'monospace', fontSize: isPortrait ? 24 : 28, fontWeight: 900, color: '#ffffff', textShadow: `0 0 15px ${theme.primary}` }}>⚡ 0ms</span>
            </div>
            <div style={{ marginTop: isPortrait ? 16 : 24, fontFamily: 'monospace', fontSize: isPortrait ? 12 : 12, letterSpacing: '2px', color: '#34d399', textTransform: 'uppercase' }}>
              ● CORE ENGINE // ACTIVE
            </div>
          </div>

          {/* Right: Stacked Telemetry Metric Cards */}
          <div style={{ width: isPortrait ? '100%' : 'auto', maxWidth: isPortrait ? 720 : undefined, flex: isPortrait ? 'none' : 1.3, display: 'flex', flexDirection: 'column', gap: isPortrait ? 14 : 16, justifyContent: 'center' }}>
            <div style={{ padding: isPortrait ? '26px 30px' : '32px 36px', borderRadius: 20, background: 'rgba(18, 16, 28, 0.9)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
              <div style={{ fontSize: isPortrait ? 12 : 13, fontFamily: 'monospace', color: theme.primary, letterSpacing: '2px', fontWeight: 700, marginBottom: 8 }}>
                // VELOCITY BENCHMARK
              </div>
              <div style={{ fontSize: isPortrait ? 58 : 68, fontWeight: 900, letterSpacing: '-2px', color: '#ffffff', lineHeight: 1, marginBottom: isPortrait ? 12 : 16 }}>
                {product.metric?.value || '< 14ms'}
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${progressWidth}%`, height: '100%', background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`, borderRadius: 100, boxShadow: `0 0 10px ${theme.primary}` }} />
              </div>
              <div style={{ marginTop: 10, fontSize: isPortrait ? 12 : 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                ↑ {product.metric?.change || 'instant throughput'}
              </div>
            </div>

            {/* Feature Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isPortrait ? 10 : 12 }}>
              {(product.features || ['Sub-Millisecond Execution', 'Zero Latency Failover']).slice(0, 2).map((feat, idx) => (
                <div key={idx} style={{ padding: isPortrait ? '12px 16px' : '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff', fontSize: isPortrait ? 13 : 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: theme.primary, flexShrink: 0 }}>✓</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ACT 3: Shockwave Climax & Bold CTA
  if (frame >= act3Start) {
    const actFrame = frame - act3Start;
    const springTitle = spring({ frame: actFrame, fps, config: { mass: 0.6, stiffness: 120, damping: 13 } });
    const springCta = spring({ frame: actFrame - 12, fps, config: { mass: 0.5, stiffness: 130, damping: 13 } });
    const shockwave = interpolate(actFrame, [0, 40], [0.8, 2.2], { extrapolateRight: 'clamp' });
    const shockOpacity = interpolate(actFrame, [0, 40], [0.8, 0], { extrapolateRight: 'clamp' });

    return (
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isPortrait ? '0 36px' : '0 80px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: isPortrait ? 320 : 400, height: isPortrait ? 320 : 400, borderRadius: '50%', border: `2px solid ${theme.primary}`, transform: `scale(${shockwave})`, opacity: shockOpacity, pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', padding: isPortrait ? '6px 18px' : '6px 18px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.primary}50`, color: '#ffffff', fontSize: isPortrait ? 12 : 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: isPortrait ? 20 : 24 }}>
          {climax.badge || 'NOW LIVE WORLDWIDE'}
        </div>

        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 84 : 108, fontWeight: 900, letterSpacing: '-3px', color: '#ffffff', margin: isPortrait ? '0 0 16px 0' : '0 0 20px 0', maxWidth: isPortrait ? 900 : 1200, textShadow: `0 0 60px ${theme.primary}80`, transform: `scale(${Math.max(0.8, springTitle)})` }}>
          {brand?.name || 'HYPERFLOW'}
        </h1>

        <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 24 : 26, fontWeight: 500, color: 'rgba(255, 255, 255, 0.82)', maxWidth: isPortrait ? 780 : 740, margin: isPortrait ? '0 0 32px 0' : '0 0 40px 0', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
          {brand?.tagline}
        </p>

        <div style={{ transform: `translateY(${(1 - Math.max(0, springCta)) * 20}px)`, opacity: Math.min(1, springCta), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: isPortrait ? '18px 44px' : '18px 48px', borderRadius: 100, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#ffffff', fontSize: isPortrait ? 17 : 18, fontWeight: 800, letterSpacing: '0.5px', boxShadow: `0 15px 40px ${theme.primary}60` }}>
            {brand?.ctaText || 'Deploy High-Velocity →'}
          </div>
          {brand?.ctaUrl && <span style={{ fontFamily: 'monospace', fontSize: isPortrait ? 13 : 14, color: 'rgba(255,255,255,0.6)' }}>{brand.ctaUrl}</span>}
        </div>
      </AbsoluteFill>
    );
  }

  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// ARCHETYPE 3: Minimalist Mobile App Showcase (iOS / Framer Product)
// ══════════════════════════════════════════════════════════════════════════════

const MobileShowcasePresentation: React.FC<{
  hook: Act1Hook;
  product: Act2Product;
  climax: Act3Climax;
  brand?: BrandConfig;
  act1End: number;
  act2Start: number;
  act2End: number;
  act3Start: number;
  maxEndFrame: number;
  theme: Theme;
}> = ({ hook, product, climax, brand, act1End, act2Start, act2End, act3Start, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  // ACT 1: Floating iOS Push Notification Banner & Greeting
  if (frame <= act1End) {
    const springNotif = spring({ frame: frame - 6, fps, config: { mass: 0.5, stiffness: 140, damping: 14 } });
    const springTitle = spring({ frame: frame - 20, fps, config: { mass: 0.7, stiffness: 110, damping: 14 } });

    return (
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isPortrait ? '0 36px' : '0 80px' }}>
        {/* Floating iOS Notification */}
        <div style={{ transform: `translateY(${(1 - Math.max(0, springNotif)) * -80}px)`, opacity: Math.min(1, springNotif), padding: isPortrait ? '12px 20px' : '14px 24px', borderRadius: 24, background: 'rgba(28, 28, 36, 0.85)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: 14, marginBottom: isPortrait ? 32 : 44, maxWidth: isPortrait ? 520 : undefined }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#ffffff', fontWeight: 900, flexShrink: 0 }}>
            {brand?.name ? brand.name[0] : 'F'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
              <span>{brand?.name || 'FocusFlow'}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>NOW</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              ⚡ Daily flow session active · Zero distractions
            </div>
          </div>
        </div>

        <div style={{ opacity: Math.min(1, springTitle), transform: `scale(${Math.max(0.85, springTitle)})` }}>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 48 : 68, fontWeight: 900, letterSpacing: '-2px', color: '#ffffff', maxWidth: isPortrait ? 840 : 960, margin: isPortrait ? '0 auto 14px auto' : '0 auto 20px auto', lineHeight: 1.2 }}>
            {hook.headline}
          </h1>
          <p style={{ fontSize: isPortrait ? 18 : 22, color: 'rgba(255,255,255,0.65)', maxWidth: isPortrait ? 720 : 680, margin: '0 auto' }}>
            {hook.subheadline}
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // ACT 2: 3D Smartphone Device Mockup
  if (frame >= act2Start && frame <= act2End) {
    const actFrame = frame - act2Start;
    const springPhone = spring({ frame: actFrame, fps, config: { mass: 0.8, stiffness: 90, damping: 14 } });
    const tiltPhone = Math.sin(actFrame * 0.04) * 3;
    const progressOffset = interpolate(actFrame, [15, 60], [280, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const phoneScale = isPortrait ? 1.12 : 0.95;

    return (
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1400 }}>
        {/* Central Smartphone Frame */}
        <div style={{ width: 400, height: 720, borderRadius: 52, background: 'radial-gradient(ellipse at 50% 0%, #1a1730 0%, #0d0b17 55%, #06050a 100%)', border: '3.5px solid rgba(255, 255, 255, 0.25)', boxShadow: `0 40px 100px -10px ${theme.primary}50, 0 35px 80px rgba(0,0,0,0.95)`, transform: `scale(${Math.max(0.8, springPhone) * phoneScale}) rotateX(8deg) rotateY(${tiltPhone - 10}deg)`, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Dynamic Island Notch */}
          <div style={{ width: 120, height: 28, borderRadius: 20, background: '#000000', margin: '14px auto 18px auto', border: '1px solid rgba(255,255,255,0.15)' }} />

          {/* Device Screen Content */}
          <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Circular Progress Ring Hero Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 22px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)', border: '1.5px solid rgba(255,255,255,0.22)', boxShadow: '0 16px 36px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)', backdropFilter: 'blur(24px)' }}>
              <svg width="84" height="84" viewBox="0 0 100 100" style={{ shrink: 0 } as any}>
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.18)" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="40" stroke={theme.primary} strokeWidth="10" fill="none" strokeDasharray="260" strokeDashoffset={progressOffset} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ filter: `drop-shadow(0 0 10px ${theme.primary})` }} />
              </svg>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{product.metric?.value || '2.4 hrs'}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>{product.metric?.change || 'Daily Saved'}</div>
              </div>
            </div>

            {/* Task Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(product.features || ['Deep Focus Engine', 'Autonomous Scheduler', 'Offline Cloud Sync']).map((feat, idx) => (
                <div key={idx} style={{ padding: '16px 18px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%)', border: '1.5px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#ffffff', flexShrink: 0 }}>✓</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>{feat}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 2 }}>{idx === 0 ? 'Verified & Active' : idx === 1 ? 'Real-time cloud sync' : 'Autonomous scheduler'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 10 }}>Done</span>
                </div>
              ))}
            </div>

            {/* Live Session Status Bar */}
            <div style={{ marginTop: 'auto', marginBottom: 4, padding: '14px 18px', borderRadius: 18, background: `linear-gradient(135deg, ${theme.primary}40, ${theme.accent}25)`, border: `1.5px solid ${theme.primary}80`, boxShadow: `0 10px 25px ${theme.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Active Focus Session</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', background: theme.primary, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.5px' }}>LIVE</span>
            </div>

            {/* iOS Bottom Indicator */}
            <div style={{ width: 130, height: 4, borderRadius: 10, background: 'rgba(255,255,255,0.5)', margin: '0 auto 10px auto' }} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ACT 3: App Store Showcase & Download Pill
  if (frame >= act3Start) {
    const actFrame = frame - act3Start;
    const springShowcase = spring({ frame: actFrame, fps, config: { mass: 0.6, stiffness: 120, damping: 13 } });

    return (
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isPortrait ? '0 36px' : '0 80px' }}>
        {/* App Squircle Icon */}
        <div style={{ width: isPortrait ? 76 : 88, height: isPortrait ? 76 : 88, borderRadius: 22, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, boxShadow: `0 20px 50px ${theme.primary}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isPortrait ? 38 : 44, color: '#ffffff', fontWeight: 900, marginBottom: isPortrait ? 20 : 28, transform: `scale(${Math.max(0.8, springShowcase)})` }}>
          {brand?.name ? brand.name[0] : 'F'}
        </div>

        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 64 : 92, fontWeight: 900, letterSpacing: '-2px', color: '#ffffff', margin: '0 0 14px 0' }}>
          {brand?.name || 'FOCUSFLOW'}
        </h1>

        <div style={{ fontSize: isPortrait ? 13 : 15, fontWeight: 700, color: '#fbbf24', letterSpacing: '1px', marginBottom: isPortrait ? 14 : 20 }}>
          ★★★★★ 4.9 · 120,000+ USER RATINGS
        </div>

        <p style={{ fontSize: isPortrait ? 18 : 24, color: 'rgba(255,255,255,0.8)', maxWidth: isPortrait ? 720 : 680, margin: isPortrait ? '0 0 28px 0' : '0 0 36px 0' }}>
          {brand?.tagline}
        </p>

        {/* Apple Store Download Pill */}
        <div style={{ padding: isPortrait ? '14px 36px' : '16px 42px', borderRadius: 100, background: '#ffffff', color: '#000000', fontSize: isPortrait ? 15 : 16, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 15px 40px rgba(255,255,255,0.2)' }}>
          <span></span>
          <span>Download on the App Store</span>
        </div>
      </AbsoluteFill>
    );
  }

  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// ARCHETYPE 4: Fintech Cyber Grid & Telemetry (Stripe / Modern Terminal)
// ══════════════════════════════════════════════════════════════════════════════

const FintechGridPresentation: React.FC<{
  hook: Act1Hook;
  product: Act2Product;
  climax: Act3Climax;
  brand?: BrandConfig;
  act1End: number;
  act2Start: number;
  act2End: number;
  act3Start: number;
  maxEndFrame: number;
  theme: Theme;
}> = ({ hook, product, climax, brand, act1End, act2Start, act2End, act3Start, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  // ACT 1: Monospace Terminal Boot Sequence & Laser Scan
  if (frame <= act1End) {
    const scanY = interpolate(frame, [0, act1End], [0, 100], { extrapolateRight: 'clamp' });
    const springHook = spring({ frame: frame - 12, fps, config: { mass: 0.6, stiffness: 120, damping: 14 } });

    return (
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isPortrait ? '0 36px' : '0 80px' }}>
        {/* Vertical Scanning Green Line */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 2, background: 'linear-gradient(90deg, transparent, #34d399, transparent)', boxShadow: '0 0 20px #34d399', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: isPortrait ? '5px 14px' : '6px 18px', borderRadius: 100, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontFamily: 'monospace', fontSize: isPortrait ? 11 : 12, fontWeight: 700, letterSpacing: '1.5px', marginBottom: isPortrait ? 20 : 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
          <span>[QUANTUM ENCRYPTION // ZERO KNOWLEDGE PROTOCOL]</span>
        </div>

        <div style={{ opacity: Math.min(1, springHook), transform: `translateY(${(1 - Math.max(0, springHook)) * 25}px)` }}>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 48 : 72, fontWeight: 900, letterSpacing: '-2px', color: '#ffffff', maxWidth: isPortrait ? 840 : 1020, margin: isPortrait ? '0 auto 14px auto' : '0 auto 20px auto', lineHeight: 1.15 }}>
            {hook.headline}
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: isPortrait ? 16 : 20, color: 'rgba(255,255,255,0.65)', maxWidth: isPortrait ? 720 : 740, margin: '0 auto' }}>
            &gt; {hook.subheadline}
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // ACT 2: 3D Holographic Payment Card & Live Ledger Feed
  if (frame >= act2Start && frame <= act2End) {
    const actFrame = frame - act2Start;
    const springCard = spring({ frame: actFrame, fps, config: { mass: 0.8, stiffness: 95, damping: 14 } });
    const cardTiltY = (isPortrait ? 8 : 16) + Math.sin(actFrame * 0.04) * 3;
    const cardWidth = isPortrait ? Math.min(460, width - 80) : 480;

    return (
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1400, padding: isPortrait ? '0 36px' : '0 80px' }}>
        <div style={{ width: isPortrait ? Math.min(840, width - 60) : 1100, maxWidth: '100%', display: isPortrait ? 'flex' : 'grid', flexDirection: isPortrait ? 'column' : undefined, gridTemplateColumns: isPortrait ? undefined : '1.2fr 1fr', gap: isPortrait ? 24 : 48, alignItems: 'center', justifyContent: 'center' }}>
          {/* Left: 3D Metallic Credit Card */}
          <div style={{ width: cardWidth, height: isPortrait ? 250 : 280, maxWidth: '100%', borderRadius: 24, background: 'linear-gradient(135deg, rgba(30, 27, 46, 0.95), rgba(12, 10, 22, 0.98))', border: '1px solid rgba(255,255,255,0.18)', boxShadow: `0 30px 80px ${theme.primary}35, 0 15px 40px rgba(0,0,0,0.8)`, transform: `scale(${Math.max(0.8, springCard)}) rotateX(-8deg) rotateY(${cardTiltY}deg)`, padding: isPortrait ? 24 : 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            {/* Gold Chip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: 48, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #fbbf24, #d97706)', border: '1px solid #f59e0b' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>)))</span>
            </div>

            {/* Embossed Card Number */}
            <div style={{ fontFamily: 'monospace', fontSize: isPortrait ? 20 : 24, letterSpacing: isPortrait ? '3px' : '4px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              •••• •••• •••• 9024
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>CARDHOLDER</div>
                <div style={{ fontSize: isPortrait ? 14 : 16, fontWeight: 700, color: '#ffffff', letterSpacing: '1px' }}>{brand?.name || 'VOLTPAY GLOBAL'}</div>
              </div>
              <div style={{ fontSize: 12, color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>VERIFIED ✓</div>
            </div>
          </div>

          {/* Right: Live Floating Transaction Ticker */}
          <div style={{ width: isPortrait ? Math.min(460, width - 80) : '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: isPortrait ? 10 : 14 }}>
            <div style={{ padding: isPortrait ? '16px 20px' : '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#34d399', letterSpacing: '1px' }}>● LIVE SETTLED // 0.02s</div>
              <div style={{ fontSize: isPortrait ? 36 : 44, fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>{product.metric?.value || '+$12,450.00'}</div>
              <div style={{ fontSize: isPortrait ? 12 : 13, color: 'rgba(255,255,255,0.6)' }}>{product.metric?.change || 'Automated Instant Liquidity'}</div>
            </div>

            <div style={{ padding: isPortrait ? '12px 16px' : '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: isPortrait ? 13 : 14, fontWeight: 600, color: '#ffffff' }}>Global Multi-Currency Rails</span>
              <span style={{ fontSize: isPortrait ? 11 : 12, color: '#38bdf8', fontFamily: 'monospace' }}>120+ COUNTRIES</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ACT 3: Global Checkout Lock & CTA
  if (frame >= act3Start) {
    const actFrame = frame - act3Start;
    const springTitle = spring({ frame: actFrame, fps, config: { mass: 0.6, stiffness: 120, damping: 13 } });

    return (
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isPortrait ? '0 36px' : '0 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: isPortrait ? '6px 18px' : '8px 22px', borderRadius: 100, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d399', color: '#34d399', fontSize: isPortrait ? 11 : 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: isPortrait ? 20 : 28 }}>
          <span>🔒</span>
          <span>GLOBAL PAYMENT CLEARING LIVE</span>
        </div>

        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: isPortrait ? 68 : 104, fontWeight: 900, letterSpacing: '-3px', color: '#ffffff', margin: isPortrait ? '0 0 14px 0' : '0 0 20px 0', maxWidth: isPortrait ? 880 : 1200, textShadow: `0 0 60px ${theme.primary}60` }}>
          {brand?.name || 'VOLTPAY'}
        </h1>

        <p style={{ fontSize: isPortrait ? 20 : 26, fontWeight: 500, color: 'rgba(255,255,255,0.85)', maxWidth: isPortrait ? 760 : 760, margin: isPortrait ? '0 0 28px 0' : '0 0 40px 0' }}>
          {brand?.tagline}
        </p>

        <div style={{ padding: isPortrait ? '15px 36px' : '18px 48px', borderRadius: 100, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#ffffff', fontSize: isPortrait ? 16 : 18, fontWeight: 800, letterSpacing: '0.5px', boxShadow: `0 15px 40px ${theme.primary}60` }}>
          {brand?.ctaText || 'Launch Instant Checkout →'}
        </div>
      </AbsoluteFill>
    );
  }

  return null;
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

        {/* Render Chosen Visual Design Archetype */}
        {(() => {
          const brandName = (activeConfig.brand?.name || '').toLowerCase();
          const brandCat = (activeConfig.brand?.categoryBadge || '').toLowerCase();
          const activeDesign: 'saas-window' | 'kinetic-punch' | 'mobile-showcase' | 'fintech-grid' =
            activeConfig.templateDesign ||
            (brandName.includes('volt') || brandCat.includes('fintech')
              ? 'fintech-grid'
              : brandName.includes('focus') || brandCat.includes('mobile') || brandCat.includes('app')
                ? 'mobile-showcase'
                : brandName.includes('hyper') || brandCat.includes('speed') || brandCat.includes('performance')
                  ? 'kinetic-punch'
                  : 'saas-window');

          if (activeDesign === 'kinetic-punch') {
            return (
              <KineticPunchPresentation
                hook={hookData}
                product={productData}
                climax={climaxData}
                brand={activeConfig.brand}
                act1End={act1End}
                act2Start={act2Start}
                act2End={act2End}
                act3Start={act3Start}
                maxEndFrame={maxEndFrame}
                theme={theme}
              />
            );
          }

          if (activeDesign === 'mobile-showcase') {
            return (
              <MobileShowcasePresentation
                hook={hookData}
                product={productData}
                climax={climaxData}
                brand={activeConfig.brand}
                act1End={act1End}
                act2Start={act2Start}
                act2End={act2End}
                act3Start={act3Start}
                maxEndFrame={maxEndFrame}
                theme={theme}
              />
            );
          }

          if (activeDesign === 'fintech-grid') {
            return (
              <FintechGridPresentation
                hook={hookData}
                product={productData}
                climax={climaxData}
                brand={activeConfig.brand}
                act1End={act1End}
                act2Start={act2Start}
                act2End={act2End}
                act3Start={act3Start}
                maxEndFrame={maxEndFrame}
                theme={theme}
              />
            );
          }

          /* Archetype 1 Default: 3D Perspective SaaS Browser Window */
          return (
            <>
              <Act1HookView hook={hookData} brand={activeConfig.brand} actEnd={act1End} />
              <Act2ProductView
                product={productData}
                brand={activeConfig.brand}
                actStart={act2Start}
                actEnd={act2End}
              />
              <Act3ClimaxView brand={activeConfig.brand} climax={climaxData} actStart={act3Start} />
            </>
          );
        })()}

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
