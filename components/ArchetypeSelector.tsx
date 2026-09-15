'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ProductPreset {
  id: string;
  title: string;
  visualStyle: string;
  design: 'saas-window' | 'kinetic-punch' | 'mobile-showcase' | 'fintech-grid';
  name: string;
  domain: string;
  tagline: string;
  metric: string;
  context: string;
  accent: string;
}

interface ArchetypeSelectorProps {
  presets: ProductPreset[];
  selectedPresetId: string;
  onSelect: (preset: ProductPreset) => void;
  disabled?: boolean;
}

function ArchetypeIcon({ design, accent }: { design: string; accent: string }) {
  if (design === 'saas-window') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <circle cx="6.5" cy="6" r="1" fill={accent} />
        <circle cx="9.5" cy="6" r="1" fill={accent} />
      </svg>
    );
  }
  if (design === 'kinetic-punch') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (design === 'mobile-showcase') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <line x1="10" y1="5" x2="14" y2="5" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export default function ArchetypeSelector({
  presets,
  selectedPresetId,
  onSelect,
  disabled = false,
}: ArchetypeSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
          Design Archetype
        </span>
        <span className="text-[10px] font-mono text-zinc-500">
          4 Unique Layouts
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {presets.map((p, idx) => {
          const isSelected = selectedPresetId === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.015, y: -1 } : {}}
              whileTap={!disabled ? { scale: 0.985 } : {}}
              className={`
                relative p-3.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden
                ${
                  isSelected
                    ? 'bg-zinc-800/90 text-white border-white/30 shadow-lg shadow-indigo-950/40 ring-1 ring-white/20'
                    : 'bg-zinc-900/50 text-zinc-400 border-white/[0.07] hover:bg-zinc-800/60 hover:text-zinc-200 hover:border-white/[0.14]'
                }
                border disabled:opacity-40 disabled:cursor-not-allowed
              `}
              style={
                isSelected
                  ? {
                      boxShadow: `0 8px 24px -6px ${p.accent}35, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }
                  : {}
              }
            >
              {/* Subtle accent line at top when selected */}
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }}
                />
              )}

              <div className="flex items-center justify-between gap-1.5 mb-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: `${p.accent}15`,
                    borderColor: `${p.accent}30`,
                  }}
                >
                  <ArchetypeIcon design={p.design} accent={p.accent} />
                </div>
                <span className={`text-[10px] font-mono font-medium ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  0{idx + 1}
                </span>
              </div>

              <div>
                <div className="font-semibold text-xs text-white leading-tight">
                  {p.title}
                </div>
                <div className={`text-[10px] mt-0.5 font-medium truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {p.visualStyle}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
