'use client';

import { motion } from 'framer-motion';

interface Step {
  num: string;
  label: string;
  detail: string;
  key: string;
}

const STEPS: Step[] = [
  { key: 'generating', num: '01', label: 'Story & Copy Synthesis', detail: 'Designing 3-act narrative & brand identity' },
  { key: 'rendering', num: '02', label: 'Remotion Engine Render', detail: 'Executing 3D perspective, shaders & typography' },
  { key: 'completed', num: '03', label: 'Master Output Ready', detail: 'H.264 1080p 60fps with synchronized audio' },
];

interface ProgressTrackerProps {
  status: string;
  progress: number;
  error?: string;
}

export default function ProgressTracker({
  status,
  progress,
  error,
}: ProgressTrackerProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.key === status);
  const isError = status === 'error';

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 rounded-2xl bg-zinc-900/80 border border-white/[0.08] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 truncate">
            Production Pipeline
          </span>
        </div>
        <span className="font-mono text-xs text-indigo-400 font-semibold shrink-0">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-5">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(5, progress)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex || status === 'completed';
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.key}
              className={`
                flex items-start gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-200
                ${isActive ? 'bg-indigo-500/10 border border-indigo-500/30' : ''}
                ${isComplete ? 'opacity-80' : ''}
                ${isPending ? 'opacity-35' : ''}
              `}
            >
              {/* Stage Badge */}
              <div
                className={`
                  w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-semibold shrink-0 mt-0.5
                  ${isComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : ''}
                  ${isActive ? 'bg-indigo-600 text-white' : ''}
                  ${isPending ? 'bg-zinc-800 text-zinc-500 border border-white/[0.04]' : ''}
                `}
              >
                {isComplete ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {step.label}
                  </p>
                  {isActive && (
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-medium shrink-0 animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug break-words">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error state */}
      {isError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error || 'An unexpected error occurred during rendering.'}
        </div>
      )}
    </div>
  );
}
