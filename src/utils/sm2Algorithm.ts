import type { SrsItem, SrsRating } from '@/types/srs';
import { addDays } from '@/utils/date';

export const MIN_EASE = 1.3;
export const GRADUATED_INTERVAL = 14; // 이 일수 이상이면 마스터(졸업) 카드

export interface Sm2State {
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100; // 부동소수점 누적 오차 방지

/** 수정된 SM-2: 평가에 따라 간격/연속 성공 횟수/난이도 계수와 다음 복습 날짜를 계산하는 순수 함수 */
export function calculateNextSrsState(
  item: Pick<SrsItem, 'repetitions' | 'interval' | 'easeFactor'>,
  rating: SrsRating,
  now: Date = new Date(),
): Sm2State {
  let { repetitions, interval, easeFactor } = item;

  if (rating === 'again') {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else if (rating === 'good') {
    interval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    interval = repetitions === 0 ? 2 : repetitions === 1 ? 8 : Math.round(interval * easeFactor * 1.3);
    repetitions += 1;
    easeFactor += 0.15;
  }

  return {
    interval,
    repetitions,
    easeFactor: round2(easeFactor),
    nextReviewDate: addDays(now, interval),
  };
}

/** 오늘 복습해야 하는지 (YYYY-MM-DD 문자열은 사전순 비교가 날짜순과 같다) */
export const isDue = (item: Pick<SrsItem, 'nextReviewDate'>, today: string) => item.nextReviewDate <= today;
