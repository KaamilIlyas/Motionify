'use client';

import { motion } from 'framer-motion';

interface PromptChipsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export default function PromptChips({
  prompts,
  onSelect,
  disabled = false,
}: PromptChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
      {prompts.map((prompt, index) => (
        <motion.button
          key={prompt}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4 + index * 0.06,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          className="
            px-4 py-2 text-sm rounded-full
            bg-surface text-foreground-muted
            border border-border
            transition-all duration-200
            hover:bg-surface-hover hover:text-foreground hover:border-border-hover
            disabled:opacity-40 disabled:cursor-not-allowed
            cursor-pointer select-none
          "
          whileHover={!disabled ? { scale: 1.03 } : {}}
          whileTap={!disabled ? { scale: 0.97 } : {}}
        >
          <span className="mr-1.5 text-violet-400 opacity-70">✦</span>
          {prompt}
        </motion.button>
      ))}
    </div>
  );
}
