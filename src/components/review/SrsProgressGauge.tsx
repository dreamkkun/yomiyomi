'use client';

import { motion } from 'framer-motion';

interface Props {
  completed: number;
  total: number;
  mastery: { fresh: number; learning: number; mastered: number; total: number };
}

const RADIUS = 40;

/** 오늘 복습 진행도 원형 게이지 + 전체 오답 노트의 숙련도 분포 */
export default function SrsProgressGauge({ completed, total, mastery }: Props) {
  const ratio = total > 0 ? completed / total : 1;

  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#f4f4f5" strokeWidth="10" />
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: ratio }}
            transition={{ duration: 0.4 }}
          />
        </svg>
        <div
          role="progressbar"
          aria-label="오늘 복습 진행도"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-lg font-black text-zinc-900">
            {completed}/{total}
          </span>
          <span className="text-[10px] font-semibold text-zinc-400">개 완료</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-zinc-900">
          오늘 복습 {completed}/{total}개
        </p>
        <p className="mb-2 text-[11px] text-zinc-500">오답 노트 {mastery.total}개의 숙련도</p>

        {mastery.total > 0 ? (
          <>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="bg-rose-400" style={{ width: `${(mastery.fresh / mastery.total) * 100}%` }} />
              <div className="bg-amber-400" style={{ width: `${(mastery.learning / mastery.total) * 100}%` }} />
              <div className="bg-emerald-500" style={{ width: `${(mastery.mastered / mastery.total) * 100}%` }} />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-semibold text-zinc-500">
              <span>🔴 신규 {mastery.fresh}</span>
              <span>🟡 학습 중 {mastery.learning}</span>
              <span>🟢 마스터 {mastery.mastered}</span>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-zinc-400">아직 틀린 문제가 없어요.</p>
        )}
      </div>
    </div>
  );
}
