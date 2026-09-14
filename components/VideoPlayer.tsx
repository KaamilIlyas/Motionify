'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { RemotionVideo, type VideoConfig } from '@/lib/template';
import { RESOLUTION_PRESETS, type ResolutionPreset } from '@/lib/config';

interface VideoPlayerProps {
  config: VideoConfig;
  resolution?: ResolutionPreset;
  className?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  config,
  resolution = 'landscape',
  className = '',
  autoPlay = true,
}: VideoPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const res = RESOLUTION_PRESETS[resolution] || RESOLUTION_PRESETS.landscape;
  const isVertical = resolution === 'vertical';

  const durationInFrames = Math.max(
    90,
    (config.elements || []).reduce((max, el) => Math.max(max, el.endFrame), 300)
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };

    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('frameupdate', onFrameUpdate);

    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('frameupdate', onFrameUpdate);
    };
  }, []);

  const formatTime = (frame: number) => {
    const totalSeconds = Math.floor(frame / 30);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`w-full max-w-full flex flex-col items-center min-w-0 ${className}`}>
      {/* Player Viewport */}
      <div
        className={`
          relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10
          shadow-2xl bg-black transition-all duration-300 w-full min-w-0
          ${isVertical ? 'max-w-[320px] aspect-[9/16]' : 'max-w-3xl aspect-[16/9]'}
        `}
      >
        <Player
          ref={playerRef}
          component={RemotionVideo}
          inputProps={{ config }}
          durationInFrames={durationInFrames}
          compositionWidth={res.width}
          compositionHeight={res.height}
          fps={30}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls
          autoPlay={autoPlay}
          loop
        />
      </div>

      {/* Director Status Bar */}
      <div className="mt-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-3xl px-1 gap-1 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-mono uppercase tracking-wider text-emerald-400 font-medium text-[10px] sm:text-[11px] truncate">
            Remotion Composition Preview
          </span>
        </div>
        <div className="font-mono text-[10px] sm:text-[11px] text-zinc-400 shrink-0">
          {formatTime(currentFrame)} / {formatTime(durationInFrames)} ({currentFrame}f)
        </div>
      </div>
    </div>
  );
}
