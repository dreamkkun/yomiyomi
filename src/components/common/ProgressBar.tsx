'use client';

import { motion } from 'framer-motion';

interface Props {
  value: number;
  max: number;
  label?: string;
}

export default function ProgressBar({ value, max, label }: Props) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600">
        <span>{label ?? '학습 진행도'}</span>
        <span>
          {value} / {max} ({percent}%)
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
