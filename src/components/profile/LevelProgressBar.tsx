'use client';

import { motion } from 'framer-motion';

interface Props {
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  percent: number;
}

export default function LevelProgressBar({ currentLevel, currentLevelXp, nextLevelXp, percent }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-zinc-600">다음 레벨 (Lv.{currentLevel + 1})까지</span>
        <span className="font-bold text-emerald-600">
          {currentLevelXp} / {nextLevelXp} XP ({percent}%)
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 w-full overflow-hidden rounded-full bg-zinc-100"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>
    </div>
  );
}
