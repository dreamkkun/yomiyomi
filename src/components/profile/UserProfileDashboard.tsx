'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, CheckCircle, Flame, Sparkles, Zap } from 'lucide-react';
import BadgeDetailModal from '@/components/profile/BadgeDetailModal';
import BadgeGrid from '@/components/profile/BadgeGrid';
import LevelProgressBar from '@/components/profile/LevelProgressBar';
import StatSummaryCard from '@/components/profile/StatSummaryCard';
import { useProgressStore } from '@/store/useProgressStore';
import type { Badge, UserStats } from '@/types/progress';
import { BADGE_CATALOG } from '@/utils/badgeEvaluator';
import { calculateLevel } from '@/utils/levelCalculator';

export default function UserProfileDashboard() {
  const [ready, setReady] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const closeModal = useCallback(() => setSelectedBadge(null), []);

  const totalScore = useProgressStore((s) => s.totalScore); // 누적 XP
  const streakDays = useProgressStore((s) => s.streakDays);
  const completedScenarioIds = useProgressStore((s) => s.completedScenarioIds);
  const badges = useProgressStore((s) => s.badges);

  useEffect(() => {
    Promise.resolve(useProgressStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  // 저장 데이터가 없거나 하이드레이션 전에는 기본값으로 렌더링
  const stats: UserStats = useMemo(() => {
    const xp = ready ? totalScore : 0;
    return {
      totalXp: xp,
      streakDays: ready ? streakDays : 0,
      completedScenarioCount: ready ? completedScenarioIds.length : 0,
      ...calculateLevel(xp),
    };
  }, [ready, totalScore, streakDays, completedScenarioIds]);

  // 마스터 뱃지 목록과 유저 획득 뱃지를 ID 기준으로 병합
  const collection: Badge[] = useMemo(() => {
    const owned = new Map((ready ? badges : []).map((b) => [b.id, b]));
    return BADGE_CATALOG.map((master) => ({ ...master, unlockedAt: owned.get(master.id)?.unlockedAt }));
  }, [ready, badges]);

  const unlockedCount = collection.filter((b) => b.unlockedAt).length;

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <Link href="/kana" className="flex items-center gap-1 text-sm font-bold text-emerald-600">
        <ArrowLeft size={16} /> 홈으로
      </Link>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-8 w-8" />
            <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-zinc-900 px-2 py-0.5 text-[10px] font-black text-white">
              Lv.{stats.currentLevel}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">학습자 대시보드</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              목표를 향해 꾸준히 일본어 경험치를 누적하고 있습니다.
            </p>
          </div>
        </div>

        <LevelProgressBar
          currentLevel={stats.currentLevel}
          currentLevelXp={stats.currentLevelXp}
          nextLevelXp={stats.nextLevelXp}
          percent={stats.levelProgressPercent}
        />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatSummaryCard
          icon={<Zap className="h-5 w-5 fill-amber-500" />}
          iconClassName="bg-amber-50 text-amber-500"
          label="총 경험치"
          value={`${stats.totalXp} XP`}
        />
        <StatSummaryCard
          icon={<Flame className="h-5 w-5 fill-rose-500" />}
          iconClassName="bg-rose-50 text-rose-500"
          label="연속 학습"
          value={`${stats.streakDays}일째`}
        />
        <StatSummaryCard
          icon={<CheckCircle className="h-5 w-5" />}
          iconClassName="bg-emerald-50 text-emerald-600"
          label="완료 시나리오"
          value={`${stats.completedScenarioCount}개`}
        />
      </section>

      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">뱃지 컬렉션</h2>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {unlockedCount} / {collection.length} 획득
          </span>
        </div>
        <BadgeGrid badges={collection} onSelect={setSelectedBadge} />
      </section>

      <BadgeDetailModal badge={selectedBadge} onClose={closeModal} />
    </div>
  );
}
