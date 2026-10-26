'use client';

import { motion } from 'framer-motion';
import type { MatchCardItem } from '@/types/matchGame';

interface Props {
  card: MatchCardItem;
  mismatch: boolean;
  onSelect: (uid: string) => void;
}

export default function MatchCard({ card, mismatch, onSelect }: Props) {
  const selected = card.isFlipped;

  const style = mismatch
    ? 'border-rose-500 bg-rose-50'
    : selected
      ? 'scale-95 border-emerald-500 bg-emerald-50 shadow-md'
      : 'border-zinc-200 bg-white hover:border-emerald-300';

  return (
    <motion.button
      type="button"
      disabled={card.isMatched}
      onClick={() => onSelect(card.uid)}
      aria-pressed={selected}
      aria-label={card.type === 'char' ? `문자 ${card.display}` : `발음 ${card.display}`}
      // 매칭 완료: 250ms 동안 축소·투명해지고 슬롯은 비활성화. 오답: 350ms 좌우 진동
      animate={
        card.isMatched
          ? { opacity: 0, scale: 0.8 }
          : mismatch
            ? { x: [-6, 6, -4, 4, 0], opacity: 1, scale: 1 }
            : { opacity: 1, scale: 1, x: 0 }
      }
      transition={card.isMatched ? { duration: 0.25 } : mismatch ? { duration: 0.35 } : { duration: 0.15 }}
      whileTap={card.isMatched ? undefined : { scale: 0.94 }}
      className={`flex aspect-square select-none flex-col items-center justify-center rounded-2xl border transition-colors ${style} ${
        card.isMatched ? 'pointer-events-none' : 'cursor-pointer'
      }`}
    >
      {card.type === 'char' ? (
        <span className="text-2xl font-black leading-none text-zinc-900 sm:text-3xl">{card.display}</span>
      ) : (
        <span className="text-center">
          <span className="block text-sm font-extrabold text-emerald-700 sm:text-base">{card.display}</span>
          {card.subText && <span className="mt-0.5 block text-[10px] font-semibold text-zinc-400">{card.subText}</span>}
        </span>
      )}
    </motion.button>
  );
}
