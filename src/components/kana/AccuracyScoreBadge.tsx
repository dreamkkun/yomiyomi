'use client';

import { motion } from 'framer-motion';
import type { TraceEvaluation } from '@/types/kana';

interface Props {
  evaluations: TraceEvaluation[];
  strokeCount: number;
  average: number;
}

const tone = (score: number) =>
  score >= 90 ? 'bg-emerald-500 text-white' : score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

/** 획별 점수 칩과 평균 정밀도 게이지 */
export default function AccuracyScoreBadge({ evaluations, strokeCount, average }: Props) {
  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: strokeCount }, (_, i) => {
          const ev = evaluations.find((e) => e.strokeOrder === i + 1);
          return (
            <span
              key={i}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                ev ? tone(ev.score) : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {i + 1}획 {ev ? ev.score : '-'}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          aria-label="평균 정밀도"
          aria-valuenow={average}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={false}
            animate={{ width: `${average}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="w-14 text-right text-[11px] font-bold text-zinc-600">평균 {average}점</span>
      </div>
    </div>
  );
}
