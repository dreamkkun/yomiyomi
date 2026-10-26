'use client';

import { useProgressStore } from '@/store/useProgressStore';
import { isDue } from '@/utils/sm2Algorithm';
import { todayString } from '@/utils/date';

/** 오늘 복습해야 하는 오답 노트 항목 수 (nextReviewDate <= 오늘) */
export function useDueCount(): number {
  return useProgressStore((s) => {
    const today = todayString();
    return Object.values(s.srsItems).filter((item) => isDue(item, today)).length;
  });
}
