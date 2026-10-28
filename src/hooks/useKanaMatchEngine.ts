'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMistakeRecorder } from '@/hooks/useMistakeRecorder';
import { useSpeech } from '@/hooks/useSpeech';
import { useProgressStore } from '@/store/useProgressStore';
import type { MiniGameRewardResult } from '@/types/progress';
import type { GameStats, MatchCardItem, MatchScript } from '@/types/matchGame';
import type { SrsItemInput } from '@/types/srs';
import { getKanaById, getKanaBySystem } from '@/utils/kanaParser';

export const TOTAL_GAME_TIME = 40; // 초
export const PAIR_COUNT = 8;
export const INPUT_LOCK_MS = 500; // 두 번째 카드 선택 후 검증 동안의 입력 잠금
export const CLEAR_BASE_XP = 80;
export const CLEAR_TIME_XP_RATE = 1.5; // 남은 1초당 추가 XP
export const PARTICIPATION_XP = 10; // 시간 초과로 끝나도 주는 기본 참여 보상
export const TIME_BONUS_PER_SECOND = 50;
export const FEVER_COMBO = 3;

interface Sound {
  playFlip: () => void;
  playMatch: () => void;
  playMismatch: () => void;
  playVictory: () => void;
}

/** 소리·음성·저장 같은 부가 동작이 실패해도 게임 입력이 멈추지 않도록 감싼다 */
const safely = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    console.error(error);
  }
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** 청음 46자 중 8자를 뽑아 [문자 카드 + 발음 카드] 16장을 섞어 만든다 */
export function buildDeck(script: MatchScript): MatchCardItem[] {
  const picked = shuffle(getKanaBySystem(script).filter((k) => k.tone === 'seion')).slice(0, PAIR_COUNT);
  return shuffle(
    picked.flatMap<MatchCardItem>((k) => [
      { uid: `${k.id}_char`, pairId: k.id, type: 'char', display: k.char, isMatched: false, isFlipped: false },
      {
        uid: `${k.id}_pron`,
        pairId: k.id,
        type: 'pronunciation',
        display: k.romaji,
        subText: k.korean,
        isMatched: false,
        isFlipped: false,
      },
    ]),
  );
}

const initialStats = (): GameStats => ({
  score: 0,
  combo: 0,
  maxCombo: 0,
  matchedPairs: 0,
  totalPairs: PAIR_COUNT,
  timeLeft: TOTAL_GAME_TIME,
  isFever: false,
  isGameOver: false,
  isCleared: false,
});

/** 점수 공식: 100 x (1 + 이전까지의 연속 콤보 x 0.2) x (피버 ? 2 : 1) */
export const calcPoints = (combo: number, isFever: boolean) =>
  Math.round(100 * (1 + combo * 0.2) * (isFever ? 2 : 1));

export function useKanaMatchEngine(script: MatchScript, sound: Sound) {
  const { speak } = useSpeech();
  const completeMiniGame = useProgressStore((s) => s.completeMiniGame);
  const recordMistake = useMistakeRecorder();

  const [cards, setCardsState] = useState<MatchCardItem[]>([]);
  const [stats, setStatsState] = useState<GameStats>(initialStats);
  const [isLocked, setLockedState] = useState(false);

  // 두 손가락 동시 터치처럼 같은 틱에 클릭이 겹쳐도 항상 최신 값을 보도록 ref 로 즉시 동기화한다
  const cardsRef = useRef<MatchCardItem[]>([]);
  const statsRef = useRef<GameStats>(initialStats());
  const lockedRef = useRef(false);
  const setCards = useCallback((next: MatchCardItem[]) => {
    cardsRef.current = next;
    setCardsState(next);
  }, []);
  const setStats = useCallback((next: GameStats) => {
    statsRef.current = next;
    setStatsState(next);
  }, []);
  const setIsLocked = useCallback((v: boolean) => {
    lockedRef.current = v;
    setLockedState(v);
  }, []);
  const [mismatchUids, setMismatchUids] = useState<string[]>([]);
  const [comboPopup, setComboPopup] = useState<{ key: number; value: number } | null>(null);
  const [reward, setReward] = useState<MiniGameRewardResult | null>(null);
  // 한 판당 정산은 정확히 한 번만: StrictMode 의 이중 실행/재렌더링으로 XP 가 중복 지급되지 않게 막는 락
  const rewardDispatchedRef = useRef(false);

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

  /** 한 판의 결과를 스토어에 정산한다 (클리어: 기본 XP + 남은 시간 보너스, 시간 초과: 참여 XP) */
  const settle = useCallback(
    (final: GameStats, cleared: boolean) => {
      if (rewardDispatchedRef.current) return;
      rewardDispatchedRef.current = true;
      const earnedXp = cleared
        ? CLEAR_BASE_XP + Math.floor(final.timeLeft * CLEAR_TIME_XP_RATE)
        : PARTICIPATION_XP;
      setReward(
        completeMiniGame({ gameId: 'kanaMatch', score: final.score, earnedXp, maxCombo: final.maxCombo, cleared }),
      );
    },
    [completeMiniGame],
  );

  const restart = useCallback(() => {
    clearTimers();
    setCards(buildDeck(script));
    setStats(initialStats());
    setIsLocked(false);
    setMismatchUids([]);
    setComboPopup(null);
    setReward(null);
    rewardDispatchedRef.current = false;
  }, [script, clearTimers, setCards, setStats, setIsLocked]);

  // 마운트(또는 문자 체계 변경) 즉시 새 판 시작. 덱은 클라이언트에서만 섞어 하이드레이션 불일치를 피한다
  useEffect(() => {
    restart();
    return clearTimers;
  }, [restart, clearTimers]);

  const finished = stats.isGameOver || stats.isCleared;
  const started = cards.length > 0;

  // 40초 카운트다운
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => {
      const prev = statsRef.current;
      if (prev.isCleared || prev.isGameOver) return;
      if (prev.timeLeft <= 1) {
        const over = { ...prev, timeLeft: 0, isGameOver: true };
        setStats(over);
        settle(over, false);
      } else {
        setStats({ ...prev, timeLeft: prev.timeLeft - 1 });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished, setStats, settle]);

  const selectCard = useCallback(
    (uid: string) => {
      const cards = cardsRef.current;
      const stats = statsRef.current;
      if (lockedRef.current || stats.isGameOver || stats.isCleared || cards.length === 0) return;
      const card = cards.find((c) => c.uid === uid);
      if (!card || card.isMatched) return;

      // 이미 선택한 카드를 다시 누르면 선택 취소
      if (card.isFlipped) {
        setCards(cards.map((c) => (c.uid === uid ? { ...c, isFlipped: false } : c)));
        return;
      }

      safely(() => sound.playFlip());
      const nextCards = cards.map((c) => (c.uid === uid ? { ...c, isFlipped: true } : c));
      const selected = nextCards.filter((c) => c.isFlipped && !c.isMatched);
      if (selected.length < 2) {
        setCards(nextCards);
        return;
      }

      // 두 장이 골라졌다. 정답이면 카드가 바로 사라지므로 입력을 막지 않고(다음 짝을 곧바로 고를 수 있다),
      // 오답일 때만 틀린 카드를 보여 주는 동안 잠깐 입력을 잠근다
      const [a, b] = selected;

      if (a.pairId === b.pairId) {
        const nextCombo = stats.combo + 1;
        const isFever = nextCombo >= FEVER_COMBO;
        const gained = calcPoints(stats.combo, isFever);
        const matchedPairs = stats.matchedPairs + 1;
        const isCleared = matchedPairs === stats.totalPairs;
        const bonus = isCleared ? stats.timeLeft * TIME_BONUS_PER_SECOND : 0;
        const score = stats.score + gained + bonus;

        setCards(nextCards.map((c) => (c.pairId === a.pairId ? { ...c, isMatched: true, isFlipped: false } : c)));
        const nextStats: GameStats = {
          ...stats,
          score,
          combo: nextCombo,
          maxCombo: Math.max(stats.maxCombo, nextCombo),
          matchedPairs,
          isFever,
          isCleared,
        };
        setStats(nextStats);
        if (nextCombo >= 2) setComboPopup({ key: Date.now(), value: nextCombo });

        safely(() => sound.playMatch());
        safely(() => speak((a.type === 'char' ? a : b).display)); // 맞힌 문자의 발음

        if (isCleared) {
          safely(() => sound.playVictory());
          settle(nextStats, true);
        }
        later(() => setComboPopup(null), INPUT_LOCK_MS);
      } else {
        // 잠금 해제를 가장 먼저 예약한다: 아래의 소리/저장 처리에서 문제가 생겨도 입력이 영영 잠기지 않게 한다
        setIsLocked(true);
        later(() => {
          setCards(cardsRef.current.map((c) => (c.uid === a.uid || c.uid === b.uid ? { ...c, isFlipped: false } : c)));
          setMismatchUids([]);
          setIsLocked(false);
        }, INPUT_LOCK_MS);

        safely(() => sound.playMismatch());
        // 잘못 짝지은 두 글자는 모두 오답 노트(SRS)에 등록된다
        const mistakes = [a.pairId, b.pairId].flatMap<SrsItemInput>((pairId) => {
          const k = getKanaById(pairId);
          return k
            ? [{ id: k.id, type: 'kana', japanese: k.char, furigana: k.char, korean: k.korean, romaji: k.romaji }]
            : [];
        });
        setCards(nextCards);
        setMismatchUids([a.uid, b.uid]);
        setStats({ ...stats, combo: 0, isFever: false }); // 오답은 콤보와 피버를 즉시 리셋
        safely(() => recordMistake(...mistakes));
      }
    },
    [sound, speak, settle, later, setCards, setStats, setIsLocked, recordMistake],
  );

  return { cards, stats, isLocked, mismatchUids, comboPopup, reward, selectCard, restart };
}
