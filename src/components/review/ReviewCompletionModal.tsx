'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, GraduationCap, Sparkles, Zap } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import type { SrsSessionResult } from '@/types/srs';

interface Props {
  result: SrsSessionResult | null; // null 이면 닫힘
}

// 보상 모달이므로 바깥 클릭/ESC 로는 닫히지 않고, 아래 버튼으로만 나간다
export default function ReviewCompletionModal({ result }: Props) {
  const { triggerRewardConfetti } = useConfetti();

  useEffect(() => {
    if (result) triggerRewardConfetti();
  }, [result, triggerRewardConfetti]);

  return (
    <AnimatePresence>
      {result && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="오늘의 복습 완료"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-xs rounded-3xl border border-zinc-100 bg-white p-6 text-center shadow-2xl"
          >
            <CheckCircle2 className="mx-auto mb-2 h-14 w-14 text-emerald-500" />
            <h2 className="text-xl font-black text-zinc-900">오늘의 복습 완료!</h2>
            <p className="mb-5 mt-1 text-xs text-zinc-500">망각곡선 스케줄에 맞춰 오답을 모두 복습했어요.</p>

            <div className="mb-5 space-y-2 rounded-2xl border border-zinc-100 bg-slate-50 p-3.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> 복습한 카드
                </span>
                <span className="font-black text-zinc-900">{result.totalReviewed}개</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> 마스터 도달 (14일+)
                </span>
                <span className="font-black text-emerald-600">{result.graduatedCount}개</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200/60 pt-2 font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> 획득 경험치
                </span>
                <span className="font-black text-amber-600">+{result.earnedXp} XP</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <Link
                href="/vocab"
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                단어장
              </Link>
              <Link
                href="/kana"
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                문자 학습
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
