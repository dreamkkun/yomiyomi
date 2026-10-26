'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { Timer, Trophy } from 'lucide-react';
import type { GameStats } from '@/types/matchGame';
import type { MiniGameRewardResult } from '@/types/progress';

interface Props {
  stats: GameStats;
  reward: MiniGameRewardResult | null; // 스토어 정산 결과 (정산 전에는 null)
  onRestart: () => void;
}

/** from -> to 로 숫자가 올라가는 카운트업 (모션 감소 설정이면 바로 최종값) */
function CountUp({ from, to, duration = 0.8 }: { from: number; to: number; duration?: number }) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(from, to, { duration, ease: 'easeOut', onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [from, to, duration]);

  return <>{value.toLocaleString()}</>;
}

export default function GameResultModal({ stats, reward, onRestart }: Props) {
  const open = stats.isGameOver || stats.isCleared;

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={stats.isCleared ? '스테이지 클리어' : '시간 초과'}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-h-[94dvh] w-full max-w-xs overflow-y-auto rounded-3xl border border-zinc-100 bg-white p-6 text-center shadow-2xl"
          >
            <div
              className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl shadow-md ${
                stats.isCleared ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              {stats.isCleared ? <Trophy className="h-8 w-8" /> : <Timer className="h-8 w-8" />}
            </div>

            <h2 className="text-xl font-black text-zinc-900">{stats.isCleared ? '스테이지 클리어!' : '시간 초과!'}</h2>
            <p className="mb-4 mt-1 text-xs text-zinc-500">
              {stats.isCleared
                ? '모든 가나 짝을 완벽히 맞추셨습니다!'
                : `${stats.totalPairs}쌍 중 ${stats.matchedPairs}쌍을 맞혔어요. 다시 도전하세요!`}
            </p>

            <div className="mb-4 space-y-2 rounded-2xl border border-zinc-100 bg-slate-50 p-3.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-zinc-500">
                <span>최종 점수</span>
                <div className="flex items-center gap-1.5">
                  {reward?.isNewHighScore && (
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-800">
                      NEW HIGH
                    </span>
                  )}
                  <span className="text-sm font-black text-zinc-900">{stats.score.toLocaleString()} P</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-zinc-500">
                <span>최고 점수</span>
                <span className="font-bold text-zinc-700">{(reward?.highScore ?? stats.score).toLocaleString()} P</span>
              </div>

              <div className="flex justify-between font-semibold text-zinc-500">
                <span>최대 콤보</span>
                <span className="font-bold text-amber-600">{stats.maxCombo} Combo</span>
              </div>

              {reward && (
                <>
                  <div className="flex justify-between border-t border-zinc-200/60 pt-2 font-semibold text-zinc-500">
                    <span>{reward.isCleared ? '획득 경험치' : '참여 보상'}</span>
                    <span className="font-black text-emerald-600">+{reward.earnedXp} XP</span>
                  </div>
                  <div className="flex justify-between font-semibold text-zinc-500">
                    <span>총 경험치</span>
                    <span className="font-bold text-zinc-700">
                      <CountUp from={reward.previousTotalXp} to={reward.currentTotalXp} /> XP · Lv.{reward.currentLevel}
                    </span>
                  </div>
                  {reward.isStreakIncremented && (
                    <div className="flex justify-between font-semibold text-zinc-500">
                      <span>연속 학습</span>
                      <span className="font-bold text-rose-500">오늘 학습 완료 🔥</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {reward && reward.newBadges.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {reward.newBadges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-emerald-50 p-2 text-left"
                  >
                    <span className="rounded-lg bg-white p-1 text-xl shadow-sm">{badge.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] font-bold uppercase text-amber-800">신규 뱃지 달성!</span>
                      <h4 className="truncate text-xs font-bold text-zinc-900">{badge.name}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex gap-2.5">
              <Link
                href="/kana"
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                문자 학습
              </Link>
              <button
                type="button"
                onClick={onRestart}
                className="min-h-12 flex-1 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                다시 플레이
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
