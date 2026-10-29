'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MessageSquareQuote, RotateCcw, Zap } from 'lucide-react';
import type { PatternCompletionModalProps } from '@/types/pattern';

// 보상 모달이므로 바깥 클릭/ESC 로는 닫히지 않고 버튼으로만 나간다
export function PatternCompletionModal({
  isOpen,
  earnedXp,
  scenario,
  onRestart,
  onNextPattern,
  onStartRoleplay,
}: PatternCompletionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="문형 조립 완료"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative max-h-[94dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-zinc-100 bg-white p-6 text-center shadow-2xl"
          >
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-black tracking-tight text-zinc-900">기초 문형 조립 완료!</h2>
            <p className="mb-4 mt-1 text-xs text-zinc-500">핵심 어순과 단어 결합 공식을 익혔어요.</p>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900">
              <div className="flex items-center gap-1.5 text-amber-700">
                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{earnedXp > 0 ? '문형 완주 보상' : '복습 완료 (이미 마스터한 문형)'}</span>
              </div>
              {earnedXp > 0 && <span className="text-sm font-black text-amber-800">+{earnedXp} XP</span>}
            </div>

            <div className="mb-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 p-4 text-left shadow-sm">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  실전 추천 단계
                </span>
                <span className="text-[11px] font-semibold text-emerald-800">{scenario.situation}</span>
              </div>

              <div className="mt-2 flex items-start gap-2">
                <div className="mt-0.5 shrink-0 rounded-lg border border-emerald-100 bg-white p-1.5 text-emerald-600 shadow-sm">
                  <MessageSquareQuote className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-extrabold text-zinc-900">{scenario.title}</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
                    방금 익힌{' '}
                    <span className="font-bold text-emerald-700 underline underline-offset-2">
                      {scenario.highlightExpression}
                    </span>{' '}
                    문형으로 직접 대화해 보세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onStartRoleplay(scenario.id)}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                <span>실전 롤플레잉 시작하기</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onRestart}
                className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-3 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>문형 다시 복습하기</span>
              </button>

              {onNextPattern && (
                <button
                  type="button"
                  onClick={onNextPattern}
                  className="min-h-10 text-xs font-semibold text-zinc-500 underline underline-offset-2 hover:text-zinc-700"
                >
                  다음 문형으로
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default PatternCompletionModal;
