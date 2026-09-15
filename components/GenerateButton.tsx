'use client';

import React from 'react';
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
      whileHover={!disabled && !loading ? { scale: 1.01, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.99 } : {}}
      className="
        relative group overflow-hidden
        w-full py-3.5 px-6 rounded-xl
        font-semibold text-sm text-white
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-200
        flex items-center justify-center gap-2.5
        shadow-xl shadow-indigo-950/60
        border border-white/20 hover:border-white/40
      "
      style={{
        background: disabled
          ? 'rgba(39, 39, 42, 0.6)'
          : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #8b5cf6 100%)',
      }}
    >
      {/* Light sweep effect on hover */}
      {!disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          <span className="font-mono text-xs uppercase tracking-wider">Directing Commercial...</span>
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
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
          </svg>
          <span className="tracking-tight">Render Commercial (1080p 60fps)</span>
          <span className="hidden sm:inline-block ml-1 text-[10px] font-mono text-indigo-200/80 bg-black/25 px-1.5 py-0.5 rounded border border-white/10">
            ⌘↵
          </span>
        </>
      )}
    </motion.button>
  );
}
