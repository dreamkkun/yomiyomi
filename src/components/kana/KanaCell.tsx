'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { MatrixCell } from '@/types/kana';

interface Props {
  kana: MatrixCell;
  memorized: boolean;
  onSelect: (kana: NonNullable<MatrixCell>) => void;
}

export default function KanaCell({ kana, memorized, onSelect }: Props) {
  // 5x10 격자 구조를 유지하기 위한 빈칸 (や행의 い/え, わ행의 う/え 등)
  if (!kana) {
    return <div aria-hidden className="min-h-16 rounded-xl border border-dashed border-zinc-300 bg-zinc-100/50" />;
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(kana)}
      aria-label={`${kana.char} ${kana.romaji} ${memorized ? '암기 완료' : ''}`.trim()}
      className={`relative flex min-h-16 flex-col items-center justify-center rounded-xl border p-2 transition-colors sm:p-3 ${
        memorized
          ? 'border-emerald-300 bg-emerald-50/60 shadow-sm'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
      }`}
    >
      {memorized && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-3 w-3 stroke-[3]" />
        </span>
      )}
      <span className="text-2xl font-bold leading-none text-zinc-900">{kana.char}</span>
      <span className="mt-1 text-[10px] font-semibold text-zinc-400">{kana.romaji}</span>
    </motion.button>
  );
}
