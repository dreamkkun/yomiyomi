'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Flame, Home, RotateCcw, Zap } from 'lucide-react';
import BadgeIcon from '@/components/conversation/BadgeIcon';
import { useConfetti } from '@/hooks/useConfetti';
import type { ScenarioReward } from '@/types/progress';

interface Props {
  isOpen: boolean;
  reward: ScenarioReward | null;
  onRestart: () => void;
  onGoHome: () => void;
}

// 닫기 동작(ESC, 오버레이 클릭)을 의도적으로 두지 않는다: 하단 버튼으로만 나갈 수 있다
export default function RewardModal({ isOpen, reward, onRestart, onGoHome }: Props) {
  const { triggerRewardConfetti } = useConfetti();

  useEffect(() => {
    if (isOpen) triggerRewardConfetti();
  }, [isOpen, triggerRewardConfetti]);

  return (
    <AnimatePresence>
      {isOpen && reward && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="시나리오 클리어"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-b from-emerald-50 to-white p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="mb-3 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              >
                <Award className="h-10 w-10" />
              </motion.div>
              <h2 className="text-xl font-extrabold text-zinc-900">시나리오 클리어!</h2>
              <p className="mt-1 text-xs text-zinc-500">대화를 끝까지 성공적으로 마쳤습니다.</p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 px-6">
              <div className="flex flex-col items-center rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3.5">
                <div className="mb-0.5 flex items-center gap-1 text-amber-600">
                  <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold tracking-wider">획득 경험치</span>
                </div>
                <span className="text-xl font-black text-amber-900">+{reward.earnedXp} XP</span>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-rose-200/60 bg-rose-50/80 p-3.5">
                <div className="mb-0.5 flex items-center gap-1 text-rose-600">
                  <Flame className="h-4 w-4 fill-rose-500 text-rose-500" />
                  <span className="text-xs font-bold tracking-wider">학습 스트릭</span>
                </div>
                <span className="text-xl font-black text-rose-900">
                  {reward.streakDays}일{' '}
                  {reward.isStreakIncremented && (
                    <span className="text-xs font-semibold text-rose-500" aria-label="증가">
                      ▲
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="mb-6 px-6">
              {reward.newBadge ? (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="animate-pulse rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <BadgeIcon badge={reward.newBadge} />
                    <div className="flex-1 text-left">
                      <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        신규 뱃지 달성!
                      </span>
                      <h4 className="mt-0.5 text-sm font-bold text-zinc-900">{reward.newBadge.name}</h4>
                      <p className="text-[11px] text-zinc-500">{reward.newBadge.description}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 p-3 text-center">
                  <p className="text-sm font-bold text-zinc-700">
                    {reward.isReview ? `복습 완료 (+${reward.earnedXp} XP)` : '시나리오 완료'}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    꾸준한 복습으로 회화 실력이 더 탄탄해지고 있습니다!
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 px-6 pb-6">
              <button
                type="button"
                onClick={onRestart}
                className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-100 px-4 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                <RotateCcw className="h-4 w-4" />
                다시 연습
              </button>
              <button
                type="button"
                onClick={onGoHome}
                className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Home className="h-4 w-4" />
                목록으로
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
