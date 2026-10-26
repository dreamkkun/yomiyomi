'use client';

import { useCallback, useState } from 'react';

export const STROKE_DURATION = 0.45; // 한 획을 긋는 시간(초)
export const STROKE_GAP = 0; // 획과 획 사이의 간격(초): 한 획이 끝나면 곧바로 다음 획 (시작 간격 0.45초)

/** 이전 획이 다 그려진 뒤 다음 획이 시작되도록 order(1부터)로 지연 시간을 계산한다 */
export const strokeDelay = (order: number) => (order - 1) * (STROKE_DURATION + STROKE_GAP);

/** 획순 애니메이션 다시 쓰기(replay): key가 바뀌면 SVG가 새로 마운트되어 처음부터 재생된다 */
export function useKanaStroke() {
  const [animationKey, setAnimationKey] = useState(0);
  const replay = useCallback(() => setAnimationKey((k) => k + 1), []);
  return { animationKey, replay };
}
