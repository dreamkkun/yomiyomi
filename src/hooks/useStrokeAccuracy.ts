'use client';

import { useCallback, useMemo, useState } from 'react';
import type { KanaStrokeItem, Point, TraceEvaluation } from '@/types/kana';
import { evaluateStrokeAccuracy, PASS_SCORE, samplePointsFromSvgPath } from '@/utils/strokeGeometry';

/** 획순 단계 진행(턴제)과 획별 판정 결과를 관리한다 */
export function useStrokeAccuracy(kana: KanaStrokeItem) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<TraceEvaluation[]>([]);
  const [userStrokes, setUserStrokes] = useState<Point[][]>([]); // 통과한 획의 사용자 궤적
  const [lastResult, setLastResult] = useState<TraceEvaluation | null>(null);

  const targets = useMemo(() => kana.strokes.map((s) => samplePointsFromSvgPath(s.d)), [kana]);
  const finished = currentIndex >= kana.strokes.length;

  /** 한 획을 채점한다. 통과하면 다음 획으로 넘어간다 */
  const submit = useCallback(
    (points: Point[]): TraceEvaluation | null => {
      if (finished) return null;
      const stroke = kana.strokes[currentIndex];
      const score = evaluateStrokeAccuracy(points, targets[currentIndex]);
      const result: TraceEvaluation = { strokeOrder: stroke.order, score, isPassed: score >= PASS_SCORE };
      setLastResult(result);

      if (result.isPassed) {
        setEvaluations((prev) => [...prev, result]);
        setUserStrokes((prev) => [...prev, points]);
        setCurrentIndex((i) => i + 1);
      }
      return result;
    },
    [finished, kana.strokes, currentIndex, targets],
  );

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setEvaluations([]);
    setUserStrokes([]);
    setLastResult(null);
  }, []);

  const averageScore = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
    : 0;

  return { currentIndex, evaluations, userStrokes, lastResult, finished, averageScore, submit, reset };
}
