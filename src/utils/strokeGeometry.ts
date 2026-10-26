import type { Point } from '@/types/kana';

export const PASS_SCORE = 70; // 이 점수 이상이면 획 통과
const SAMPLE_COUNT = 24;
const CURVE_STEPS = 16;
const SCORE_PER_UNIT_ERROR = 5; // 평균 오차 1(=0~100 좌표계의 1)당 감점

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** 절대좌표 M/L/C 로 이루어진 path(d)를 폴리라인으로 펼친다 (DOM 없이 계산하므로 SSR/테스트에서도 동작) */
export function flattenPath(d: string): Point[] {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const pts: Point[] = [];
  let i = 0;
  let cmd = '';
  let cur: Point = { x: 0, y: 0 };
  const num = () => Number(tokens[i++]);
  const pt = (): Point => ({ x: num(), y: num() });

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === 'M' || cmd === 'L') {
      cur = pt();
      pts.push(cur);
      if (cmd === 'M') cmd = 'L';
    } else if (cmd === 'C') {
      const p1 = pt(), p2 = pt(), p3 = pt();
      for (let s = 1; s <= CURVE_STEPS; s++) {
        const t = s / CURVE_STEPS, u = 1 - t;
        pts.push({
          x: u * u * u * cur.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
          y: u * u * u * cur.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
        });
      }
      cur = p3;
    } else {
      throw new Error(`지원하지 않는 path 명령: ${cmd}`);
    }
  }
  return pts;
}

export function polylineLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += dist(points[i - 1], points[i]);
  return len;
}

/** 호 길이 기준으로 n개의 등간격 점을 뽑는다 (그리는 속도와 무관하게 비교하기 위함) */
export function resample(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  const total = polylineLength(points);
  if (points.length === 1 || total === 0) return Array.from({ length: n }, () => ({ ...points[0] }));

  const out: Point[] = [];
  let seg = 1;
  let acc = 0; // points[seg-1] 까지의 누적 길이
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (seg < points.length - 1 && acc + dist(points[seg - 1], points[seg]) < target) {
      acc += dist(points[seg - 1], points[seg]);
      seg++;
    }
    const a = points[seg - 1], b = points[seg];
    const segLen = dist(a, b) || 1;
    const t = Math.min(1, Math.max(0, (target - acc) / segLen));
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

/** SVG path 문자열에서 등간격 샘플 포인트 추출 (0~100 기준) */
export const samplePointsFromSvgPath = (pathD: string, numSamples = SAMPLE_COUNT): Point[] =>
  resample(flattenPath(pathD), numSamples);

const meanNearest = (from: Point[], to: Point[]) =>
  from.reduce((sum, p) => sum + Math.min(...to.map((q) => dist(p, q))), 0) / from.length;

/**
 * 사용자가 그린 궤적과 목표 획의 유사도(0~100).
 * - 순서 대응 오차: 같은 위치에 같은 방향으로 그었는지 (역방향·뒤집힌 획은 크게 감점)
 * - 최근접 오차: 양방향으로 측정해 목표 위에 아무렇게나 휘갈겨 쓴 경우도 감점
 * - 너무 짧게 긋거나 점으로 찍은 경우 상한 점수 적용 (짧은 점 획은 예외)
 */
export function evaluateStrokeAccuracy(userPoints: Point[], targetPoints: Point[]): number {
  if (userPoints.length < 1 || targetPoints.length < 2) return 0;

  const u = resample(userPoints, SAMPLE_COUNT);
  const t = resample(targetPoints, SAMPLE_COUNT);

  const ordered = u.reduce((sum, p, i) => sum + dist(p, t[i]), 0) / SAMPLE_COUNT;
  const nearest = (meanNearest(t, u) + meanNearest(u, t)) / 2;
  const composite = 0.6 * ordered + 0.4 * nearest;

  let score = 100 - composite * SCORE_PER_UNIT_ERROR;

  const targetLen = polylineLength(targetPoints);
  if (targetLen > 8 && polylineLength(userPoints) < targetLen * 0.6) score = Math.min(score, 40);

  // 일정 길이 이상의 획은 시작점/끝점이 뒤바뀌었으면(역방향으로 그었으면) 통과하지 못하게 한다
  if (targetLen >= 20) {
    const us = userPoints[0], ue = userPoints[userPoints.length - 1];
    const ts = targetPoints[0], te = targetPoints[targetPoints.length - 1];
    if (dist(us, ts) + dist(ue, te) > dist(us, te) + dist(ue, ts)) score = Math.min(score, 50);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
