'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import vocabData from '@/data/vocabularies.json';
import type { VocabCategory, Vocabulary } from '@/types/vocab';

export const ALL_WORDS = vocabData as Vocabulary[];

/** 카테고리 필터링, 카드 위치/플립, 암기 완료 처리 */
export function useVocabStudy() {
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<VocabCategory>('all');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const memorizedWordIds = useProgressStore((s) => s.memorizedWordIds);
  const toggleMemorize = useProgressStore((s) => s.toggleMemorize);

  useEffect(() => {
    Promise.resolve(useProgressStore.persist.rehydrate()).then(() => setReady(true));
    return () => clearTimeout(timer.current);
  }, []);

  const words = useMemo(
    () => (category === 'all' ? ALL_WORDS : ALL_WORDS.filter((w) => w.category === category)),
    [category],
  );

  const memorizedSet = useMemo(() => new Set(ready ? memorizedWordIds : []), [ready, memorizedWordIds]);

  const current: Vocabulary | undefined = words[index];

  // 다음 카드의 답이 뒤집히는 중에 비쳐 보이지 않도록 먼저 앞면으로 돌린 뒤 단어를 교체한다
  const go = useCallback(
    (delta: number) => {
      if (words.length === 0) return;
      setFlipped(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setIndex((i) => (i + delta + words.length) % words.length);
      }, 150);
    },
    [words.length],
  );

  const selectCategory = useCallback((next: VocabCategory) => {
    clearTimeout(timer.current);
    setCategory(next);
    setIndex(0);
    setFlipped(false);
  }, []);

  const memorizedCount = words.filter((w) => memorizedSet.has(w.id)).length;

  return {
    ready,
    category,
    selectCategory,
    words,
    current,
    index,
    flipped,
    toggleFlip: () => setFlipped((f) => !f),
    next: () => go(1),
    prev: () => go(-1),
    memorizedSet,
    toggleMemorize,
    memorizedCount,
  };
}
