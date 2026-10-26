'use client';

import { useCallback } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { useToastStore } from '@/store/useToastStore';
import type { SrsItemInput } from '@/types/srs';

const TOAST_MS = 1500;

/** 오답을 SRS 오답 노트에 자동 등록하고 "오답 노트에 저장됨" 토스트를 1.5초간 보여 준다 */
export function useMistakeRecorder() {
  const recordMistake = useProgressStore((s) => s.recordMistake);
  const showToast = useToastStore((s) => s.show);

  return useCallback(
    (...items: SrsItemInput[]) => {
      if (items.length === 0) return;
      items.forEach(recordMistake);
      showToast('오답 노트에 저장됨', TOAST_MS);
    },
    [recordMistake, showToast],
  );
}
