'use client';

import { motion } from 'framer-motion';

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function GenerateButton({
  onClick,
  loading,
  disabled,
}: GenerateButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.99 } : {}}
      className="
        w-full sm:w-auto
        px-6 sm:px-8 py-3 rounded-xl
        font-semibold text-sm text-white
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-200
        flex items-center justify-center gap-2.5
        shadow-lg shadow-indigo-950/50
        border border-indigo-400/30 hover:border-indigo-400/60
      "
      style={{
        background: disabled
          ? 'rgba(99, 102, 241, 0.2)'
          : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
      }}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          <span className="font-medium">Directing Launch Video...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 text-indigo-200 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Render Commercial (1080p 60fps)</span>
        </>
      )}
    </motion.button>
  );
}
