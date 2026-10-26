'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Point } from '@/types/kana';

const INK_COLOR = '#059669'; // emerald-600
const INK_WIDTH = 8; // CSS px

interface Options {
  /** 이미 통과해 화면에 남겨 둘 획들 (0~100 정규화 좌표) */
  completedStrokes: Point[][];
  /** 한 획을 다 그렸을 때 호출 (좌표는 0~100 정규화) */
  onStrokeEnd: (points: Point[]) => void;
  /** 포인터를 누른 순간 (사용자 제스처 안에서 오디오 잠금 해제 등에 사용) */
  onDrawStart?: () => void;
  /** 그리는 중 포인터가 움직일 때마다 */
  onDrawMove?: () => void;
  disabled?: boolean;
}

/** Retina 보정(devicePixelRatio) + PointerEvent 기반 필기 */
export function useCanvasDraw({ completedStrokes, onStrokeEnd, onDrawStart, onDrawMove, disabled = false }: Options) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);

  // 최신 값을 이벤트 핸들러/ResizeObserver에서 쓰기 위한 ref
  const completedRef = useRef(completedStrokes);
  const onEndRef = useRef(onStrokeEnd);
  const onStartRef = useRef(onDrawStart);
  const onMoveRef = useRef(onDrawMove);
  const disabledRef = useRef(disabled);
  completedRef.current = completedStrokes;
  onEndRef.current = onStrokeEnd;
  onStartRef.current = onDrawStart;
  onMoveRef.current = onDrawMove;
  disabledRef.current = disabled;

  const setupContext = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = INK_WIDTH;
    ctx.strokeStyle = INK_COLOR;
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, width, height);
    setupContext(ctx);
    const draw = (pts: Point[]) => {
      if (pts.length === 0) return;
      ctx.beginPath();
      ctx.moveTo((pts[0].x / 100) * width, (pts[0].y / 100) * height);
      if (pts.length === 1) ctx.lineTo((pts[0].x / 100) * width + 0.01, (pts[0].y / 100) * height); // 점 하나도 보이게
      for (const p of pts.slice(1)) ctx.lineTo((p.x / 100) * width, (p.y / 100) * height);
      ctx.stroke();
    };
    completedRef.current.forEach(draw);
    draw(currentRef.current);
  }, []);

  // 캔버스 물리 해상도를 CSS 크기의 2~3배로 맞추고, 크기가 바뀌면 다시 그린다
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  // 통과한 획 목록이 바뀌면(통과/초기화) 다시 그린다
  useEffect(() => {
    redraw();
  }, [completedStrokes, redraw]);

  const toPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabledRef.current) return;
    onStartRef.current?.();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 일부 환경에서는 캡처를 지원하지 않을 수 있다
    }
    drawingRef.current = true;
    currentRef.current = [toPoint(e)];
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    onMoveRef.current?.();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const prev = currentRef.current[currentRef.current.length - 1];
    const next = toPoint(e);
    currentRef.current.push(next);

    const { width, height } = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo((prev.x / 100) * width, (prev.y / 100) * height);
    ctx.lineTo((next.x / 100) * width, (next.y / 100) * height);
    ctx.stroke();
  };

  const finish = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // 이미 해제된 경우
    }
    onEndRef.current(currentRef.current);
  };

  /** 아직 판정되지 않은(진행 중이거나 불합격한) 궤적을 지운다 */
  const clearCurrent = useCallback(() => {
    currentRef.current = [];
    drawingRef.current = false;
    redraw();
  }, [redraw]);

  return {
    canvasRef,
    clearCurrent,
    handlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish },
  };
}
