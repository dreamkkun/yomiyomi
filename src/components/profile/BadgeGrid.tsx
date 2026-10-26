'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Badge } from '@/types/progress';

interface Props {
  badges: Badge[];
  onSelect: (badge: Badge) => void;
}

export const formatDate = (iso: string) => iso.replaceAll('-', '.');

export default function BadgeGrid({ badges, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {badges.map((badge) => {
        const unlocked = Boolean(badge.unlockedAt);
        return (
          <motion.button
            key={badge.id}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(badge)}
            aria-label={`${badge.name} ${unlocked ? '획득' : '잠김'}`}
            className={`relative flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-colors ${
              unlocked
                ? 'border-amber-300 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-zinc-200 bg-zinc-50'
            }`}
          >
            <div className="relative">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-xl border bg-white text-3xl ${
                  unlocked ? 'border-emerald-200 shadow-sm' : 'grayscale opacity-40'
                }`}
              >
                {badge.icon}
              </span>
              {!unlocked && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-white">
                  <Lock className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <h3 className={`mt-2 text-xs font-bold ${unlocked ? 'text-zinc-900' : 'text-zinc-500'}`}>
              {badge.name}
            </h3>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">
              {unlocked ? `${formatDate(badge.unlockedAt!)} 달성` : badge.requirementText}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
