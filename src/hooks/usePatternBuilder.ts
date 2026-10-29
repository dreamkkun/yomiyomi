'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useSpeech } from '@/hooks/useSpeech';
import { useProgressStore } from '@/store/useProgressStore';
import patternsData from '@/data/sentencePatterns.json';
import type { PatternBlock, PatternExercise, PatternRound, PatternStep } from '@/types/pattern';
import { formatKorean } from '@/utils/koreanJosa';
import { buildRound, isRoundCorrect } from '@/utils/patternRound';

export const PATTERNS = patternsData as PatternExercise[];
export const SLOT_FULL_SPEAK_DELAY_MS = 300; // 슬롯이 다 차면 이 시간 뒤에 문장을 한 번 읽어 준다
export const WRONG_SHAKE_MS = 350;

export type PatternStatus = 'idle' | 'wrong' | 'correct';

/** 문형 하나를 [단어 갈아끼우기 -> 어순 배열 -> 한국어 보고 완성] 3단계로 연습하는 상태 머신 */
export function usePatternBuilder() {
  const { speak } = useSpeech();
  const { playCorrect, playWrong } = useSoundEffect();
  const completePattern = useProgressStore((s) => s.completePattern);

  const [patternIndex, setPatternIndex] = useState(0);
  const [step, setStep] = useState<PatternStep>(1);
  const [round, setRound] = useState<PatternRound | null>(null);
  const [placed, setPlaced] = useState<(PatternBlock | null)[]>([]);
  const [status, setStatus] = useState<PatternStatus>('idle');
  const [mastery, setMastery] = useState<{ earnedXp: number; isFirstMaster: boolean } | null>(null);

  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const pattern = PATTERNS[patternIndex];

  const start = useCallback(
    (index: number, nextStep: PatternStep) => {
      clearTimers();
      const next = buildRound(PATTERNS[index], nextStep);
      setPatternIndex(index);
      setStep(nextStep);
      setRound(next);
      setPlaced(Array(next.slotCount).fill(null));
      setStatus('idle');
      setMastery(null);
    },
    [clearTimers],
  );

  // 문제는 무작위로 섞이므로 서버 렌더와 어긋나지 않도록 마운트 후에 만든다
  useEffect(() => {
    start(0, 1);
    return clearTimers;
  }, [start, clearTimers]);

  const sentenceOf = useCallback(
    (blocks: (PatternBlock | null)[], r: PatternRound) =>
      r.step === 1
        ? `${blocks[0]?.japanese ?? ''}${pattern.fixedSuffix.japanese}`
        : blocks.map((b) => b?.japanese ?? '').join(''),
    [pattern],
  );

  const nounOf = useCallback(
    (blocks: (PatternBlock | null)[], r: PatternRound) => (r.step === 1 ? blocks[0]?.korean : r.targetNoun.korean),
    [],
  );

  const poolBlocks = useMemo(
    () => (round ? round.pool.filter((b) => !placed.some((p) => p?.id === b.id)) : []),
    [round, placed],
  );
  const isFull = placed.length > 0 && placed.every((b) => b !== null);

  const tapPoolBlock = useCallback(
    (block: PatternBlock) => {
      if (!round || status !== 'idle') return;

      let next: (PatternBlock | null)[];
      if (round.slotCount === 1) {
        next = [block]; // 단어 갈아끼우기: 이미 끼워져 있으면 새 블록으로 교체
      } else {
        const empty = placed.findIndex((b) => b === null);
        if (empty < 0) return;
        next = placed.map((b, i) => (i === empty ? block : b));
      }
      setPlaced(next);

      // 1단계: 슬롯이 채워지면 합성 문장을 한 번 읽어 준다
      if (round.step === 1) {
        later(() => speak(sentenceOf(next, round)), SLOT_FULL_SPEAK_DELAY_MS);
      }
    },
    [round, status, placed, later, speak, sentenceOf],
  );

  /** 슬롯에 들어간 블록을 탭하면 풀로 되돌린다 */
  const tapSlot = useCallback(
    (index: number) => {
      if (status !== 'idle') return;
      setPlaced((prev) => prev.map((b, i) => (i === index ? null : b)));
    },
    [status],
  );

  const verify = useCallback(() => {
    if (!round || status !== 'idle' || !isFull) return;

    if (isRoundCorrect(round, placed)) {
      setStatus('correct');
      playCorrect();
      if (round.step !== 1) speak(sentenceOf(placed, round)); // 2·3단계는 정답이 확인된 뒤에 읽어 준다
      if (round.step === 3) setMastery(completePattern(pattern.id));
    } else {
      setStatus('wrong');
      playWrong();
      // 흔들린 뒤 블록들이 원래 자리(풀)로 돌아간다
      later(() => {
        setPlaced(Array(round.slotCount).fill(null));
        setStatus('idle');
      }, WRONG_SHAKE_MS);
    }
  }, [round, status, isFull, placed, pattern.id, playCorrect, playWrong, speak, sentenceOf, completePattern, later]);

  const nextStep = useCallback(() => {
    if (step < 3) start(patternIndex, (step + 1) as PatternStep);
  }, [step, patternIndex, start]);

  const selectPattern = useCallback((index: number) => start(index, 1), [start]);
  const nextPattern = useCallback(() => start((patternIndex + 1) % PATTERNS.length, 1), [patternIndex, start]);
  const retryPattern = useCallback(() => start(patternIndex, 1), [patternIndex, start]);

  const koreanSentence = round && status === 'correct' ? formatKorean(pattern.koreanTemplate, nounOf(placed, round) ?? '') : null;
  const prompt = round && round.step === 3 ? formatKorean(pattern.koreanTemplate, round.targetNoun.korean) : null;
  const previewJapanese = round && isFull ? sentenceOf(placed, round) : null;

  return {
    patterns: PATTERNS,
    pattern,
    patternIndex,
    step,
    round,
    placed,
    poolBlocks,
    isFull,
    status,
    mastery,
    koreanSentence,
    prompt,
    previewJapanese,
    tapPoolBlock,
    tapSlot,
    verify,
    nextStep,
    selectPattern,
    nextPattern,
    retryPattern,
    speak,
  };
}
