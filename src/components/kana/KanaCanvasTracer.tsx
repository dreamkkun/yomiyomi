'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';
import AccuracyScoreBadge from '@/components/kana/AccuracyScoreBadge';
import { StrokeGuide } from '@/components/kana/StrokeRenderer';
import { useCanvasDraw } from '@/hooks/useCanvasDraw';
import { useHandwritingSound } from '@/hooks/useHandwritingSound';
import { useStrokeAccuracy } from '@/hooks/useStrokeAccuracy';
import type { KanaStrokeItem, Point } from '@/types/kana';

interface Props {
  kana: KanaStrokeItem;
  onComplete?: (averageScore: number) => void;
  /** 모달처럼 바깥에서 글자 정보를 이미 보여 주는 경우 false */
  showTitle?: boolean;
}

const RETRY_CLEAR_MS = 600;

export default function KanaCanvasTracer({ kana, onComplete, showTitle = true }: Props) {
  const accuracy = useStrokeAccuracy(kana);
  const { playBrushStroke, stopBrushStroke, playSuccess, playFailure, unlockAudioContext } = useHandwritingSound();
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [locked, setLocked] = useState(false); // 불합격 궤적이 지워지는 동안 입력 잠금
  const retryTimer = useRef<ReturnType<typeof setTimeout>>();
  const clearRef = useRef<() => void>(() => {});

  const { currentIndex, finished, evaluations, userStrokes, averageScore, submit } = accuracy;

  const handleStrokeEnd = useCallback(
    (points: Point[]) => {
      stopBrushStroke(); // 붓을 뗐으니 마찰음 페이드아웃
      const result = submit(points);
      if (!result) return;

      if (result.isPassed) {
        playSuccess();
        setFeedback({ text: `${result.score >= 90 ? 'Great!' : 'Pass!'} (${result.score}점)`, error: false });
      } else {
        playFailure();
        setFeedback({ text: `다시 시도해보세요 (${result.score}점)`, error: true });
        setLocked(true);
        clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => {
          clearRef.current();
          setLocked(false);
        }, RETRY_CLEAR_MS);
      }
    },
    [submit, stopBrushStroke, playSuccess, playFailure],
  );

  const draw = useCanvasDraw({
    completedStrokes: userStrokes,
    onStrokeEnd: handleStrokeEnd,
    onDrawStart: () => void unlockAudioContext(), // 첫 제스처에서 AudioContext 생성/resume
    onDrawMove: playBrushStroke,
    disabled: finished || locked,
  });
  clearRef.current = draw.clearCurrent;

  useEffect(() => () => clearTimeout(retryTimer.current), []);

  // 모든 획을 통과했을 때 한 번만 알린다
  const notified = useRef(false);
  useEffect(() => {
    if (finished && !notified.current) {
      notified.current = true;
      onComplete?.(averageScore);
    }
    if (!finished) notified.current = false;
  }, [finished, averageScore, onComplete]);

  const resetStroke = () => {
    clearTimeout(retryTimer.current);
    setLocked(false);
    setFeedback(null);
    draw.clearCurrent();
  };

  const resetAll = () => {
    resetStroke();
    accuracy.reset();
  };

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center">
      <div className="mb-2 flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {showTitle && (
            <>
              <span className="text-sm font-black text-zinc-900">{kana.char}</span>
              <span className="text-xs font-medium text-zinc-400">({kana.romaji})</span>
            </>
          )}
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {finished ? '완성' : `${currentIndex + 1} / ${kana.strokes.length}획`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            aria-pressed={showGuide}
            title="가이드 표시 전환"
            aria-label="가이드 표시 전환"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            {showGuide ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={resetStroke}
            title="획 초기화"
            aria-label="획 초기화"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 캔버스와 SVG 가이드는 같은 정사각형 영역(0~100 좌표)을 공유한다 */}
      <div className="relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-zinc-200 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-20">
          <div className="border-b border-r border-dashed border-zinc-600" />
          <div className="border-b border-dashed border-zinc-600" />
          <div className="border-r border-dashed border-zinc-600" />
          <div />
        </div>

        {showGuide && (
          <StrokeGuide
            item={kana}
            currentIndex={currentIndex}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        )}

        <canvas
          ref={draw.canvasRef}
          {...draw.handlers}
          aria-label={`${kana.char} 따라 쓰기 캔버스`}
          className="absolute inset-0 z-10 h-full w-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />

        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-600/90 p-4 text-white backdrop-blur-sm"
            >
              <Sparkles className="mb-2 h-10 w-10" />
              <h4 className="text-lg font-black tracking-wide">쓰기 완성!</h4>
              <p className="mt-1 text-xs opacity-90">평균 정밀도: {averageScore}점</p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-4 min-h-12 rounded-xl bg-white px-4 text-xs font-bold text-emerald-800 shadow-md transition-all hover:bg-emerald-50 active:scale-95"
              >
                다시 연습하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 flex h-6 items-center justify-center" aria-live="polite">
        {feedback && !finished && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-1.5 text-xs font-bold ${feedback.error ? 'text-rose-500' : 'text-emerald-600'}`}
          >
            {feedback.error ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 stroke-[3]" />}
            <span>{feedback.text}</span>
          </motion.div>
        )}
      </div>

      <div className="mt-1 w-full">
        <AccuracyScoreBadge evaluations={evaluations} strokeCount={kana.strokes.length} average={averageScore} />
      </div>

      <button
        type="button"
        onClick={resetAll}
        className="mt-3 min-h-10 rounded-xl bg-zinc-100 px-4 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200"
      >
        전체 다시 쓰기
      </button>
    </div>
  );
}
