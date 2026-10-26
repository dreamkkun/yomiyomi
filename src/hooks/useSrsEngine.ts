'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SRS_SESSION_XP, useProgressStore } from '@/store/useProgressStore';
import type { SrsItem, SrsRating, SrsSessionResult } from '@/types/srs';
import { todayString } from '@/utils/date';
import { calculateNextSrsState, GRADUATED_INTERVAL, isDue } from '@/utils/sm2Algorithm';

interface Session {
  queue: SrsItem[]; // 앞에서부터 차례로 복습 (Again 은 맨 뒤로 되돌아온다)
  total: number;
  completed: number; // Good/Easy 로 졸업한 카드 수
  result: SrsSessionResult | null; // 세션이 끝나면 보상 정산 결과
}

/** 평가별로 다음 복습이 며칠 뒤인지 미리 계산해 버튼에 보여 준다 */
export function previewIntervals(item: SrsItem) {
  return {
    again: calculateNextSrsState(item, 'again').interval,
    good: calculateNextSrsState(item, 'good').interval,
    easy: calculateNextSrsState(item, 'easy').interval,
  };
}

export function useSrsEngine() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const reviewedIds = useRef(new Set<string>());
  const finishedRef = useRef(false); // 세션 보상은 정확히 한 번만

  const srsItems = useProgressStore((s) => s.srsItems);
  const updateSrsReview = useProgressStore((s) => s.updateSrsReview);
  const completeSrsSession = useProgressStore((s) => s.completeSrsSession);

  useEffect(() => {
    Promise.resolve(useProgressStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  // 저장된 데이터를 불러온 직후, 그 시점의 복습 대상으로 세션 덱을 한 번 고정한다
  useEffect(() => {
    if (!ready || session) return;
    const today = todayString();
    const due = Object.values(useProgressStore.getState().srsItems)
      .filter((item) => isDue(item, today))
      // 오래 밀린 것, 많이 틀린 것부터
      .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate) || b.mistakeCount - a.mistakeCount);
    setSession({ queue: due, total: due.length, completed: 0, result: null });
  }, [ready, session]);

  const rate = useCallback(
    (rating: SrsRating) => {
      if (!session || session.result || session.queue.length === 0) return;
      const [current, ...rest] = session.queue;

      updateSrsReview(current.id, rating); // SM-2 결과를 스토어에 즉시 반영
      reviewedIds.current.add(current.id);

      if (rating === 'again') {
        setSession({ ...session, queue: [...rest, current] });
        return;
      }

      const completed = session.completed + 1;
      if (rest.length > 0) {
        setSession({ ...session, queue: rest, completed });
        return;
      }

      // 모든 카드가 Good/Easy 를 받았다: 세션 완료 (+60 XP)
      let result: SrsSessionResult | null = null;
      if (!finishedRef.current) {
        finishedRef.current = true;
        const items = useProgressStore.getState().srsItems;
        const graduatedCount = [...reviewedIds.current].filter(
          (id) => (items[id]?.interval ?? 0) >= GRADUATED_INTERVAL,
        ).length;
        result = completeSrsSession({ totalReviewed: session.total, graduatedCount });
      }
      setSession({ ...session, queue: [], completed, result });
    },
    [session, updateSrsReview, completeSrsSession],
  );

  // 숙련도 분포: 신규(연속 성공 0) / 학습 중 / 마스터(간격 14일 이상)
  const mastery = useMemo(() => {
    const items = Object.values(srsItems);
    return {
      fresh: items.filter((i) => i.repetitions === 0).length,
      mastered: items.filter((i) => i.interval >= GRADUATED_INTERVAL).length,
      learning: items.filter((i) => i.repetitions > 0 && i.interval < GRADUATED_INTERVAL).length,
      total: items.length,
    };
  }, [srsItems]);

  return {
    ready,
    session,
    currentCard: session?.queue[0],
    isEmpty: !!session && session.total === 0,
    rate,
    mastery,
    sessionXp: SRS_SESSION_XP,
  };
}
