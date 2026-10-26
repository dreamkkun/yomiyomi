'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useDueCount } from '@/hooks/useDueCount';
import type { DueReviewBannerProps } from '@/types/srs';

/** 오늘 복습해야 할 오답(nextReviewDate <= 오늘)이 있으면 복습 화면으로 안내하는 배너 */
export function DueReviewBanner({ className = '', showAllCompletedState = false, onNavigate }: DueReviewBannerProps) {
  // 날짜에 의존하는 값이라 서버 렌더와 어긋나지 않도록 마운트 이후에만 그린다
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const dueCount = useDueCount();

  if (!isMounted) return null;
  if (dueCount === 0 && !showAllCompletedState) return null;

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait" initial>
        {dueCount > 0 ? (
          <motion.div
            key="due-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* 배너 전체가 /review 로 가는 링크: 키보드·스크린리더로도 접근할 수 있고 미리 불러오기도 된다 */}
            <Link
              href="/review"
              onClick={onNavigate}
              aria-label={`오늘 복습할 항목 ${dueCount}개, 지금 복습하기`}
              className="group relative flex items-center justify-between rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 p-3.5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 bg-white text-emerald-600 shadow-sm">
                  <BrainCircuit className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-emerald-200/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      SRS 복습
                    </span>
                    <span className="truncate text-xs font-semibold text-emerald-900">망각 방지 타이머 가동 중</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-extrabold text-zinc-900 sm:text-sm">
                    오늘 복습할 항목이{' '}
                    <span className="text-emerald-600 underline decoration-emerald-400 underline-offset-2">
                      {dueCount}개
                    </span>{' '}
                    기다리고 있어요!
                  </p>
                </div>
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-1">
                <span className="hidden text-xs font-bold text-emerald-700 transition-colors group-hover:text-emerald-800 sm:inline-block">
                  지금 복습하기
                </span>
                <span className="rounded-lg bg-emerald-600 p-1.5 text-white shadow-sm transition-all group-hover:translate-x-0.5 group-hover:bg-emerald-700">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="completed-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-zinc-800">오늘의 복습을 모두 마쳤습니다!</h4>
                <p className="text-[11px] text-zinc-400">다음 복습일에 맞춰 자동으로 알려드릴게요.</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200/60 bg-zinc-50 px-2.5 py-1 text-[11px] font-bold text-zinc-500">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>완료됨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DueReviewBanner;
