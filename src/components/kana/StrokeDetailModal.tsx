'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, PenTool, Sparkles, Volume2, X } from 'lucide-react';
import KanaCanvasTracer from '@/components/kana/KanaCanvasTracer';
import StrokeAnimationView from '@/components/kana/StrokeAnimationView';
import { useKanaAudio } from '@/hooks/useKanaAudio';
import type { KanaStrokeItem, ModalTabMode } from '@/types/kana';
import { PASS_SCORE } from '@/utils/strokeGeometry';

interface Props {
  kana: KanaStrokeItem | null; // null 이면 닫힘 (닫힘 애니메이션을 위해 컴포넌트 자체는 유지)
  memorized: boolean;
  onClose: () => void;
  onToggleMemorize: (id: string) => void;
}

const TABS: { id: ModalTabMode; label: string; icon: typeof Eye }[] = [
  { id: 'animate', label: '획순 보기', icon: Eye },
  { id: 'trace', label: '직접 쓰기', icon: PenTool },
];

export default function StrokeDetailModal({ kana, memorized, onClose, onToggleMemorize }: Props) {
  const [activeTab, setActiveTab] = useState<ModalTabMode>('animate');
  const [traceScore, setTraceScore] = useState<number | null>(null);
  const { speakKana } = useKanaAudio();

  // 다른 글자를 열면 획순 보기부터, 점수 배지는 초기화
  const kanaId = kana?.id;
  useEffect(() => {
    setActiveTab('animate');
    setTraceScore(null);
  }, [kanaId]);

  useEffect(() => {
    if (!kana) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [kana, onClose]);

  const handleTraceComplete = useCallback(
    (score: number) => {
      setTraceScore(score);
      // 합격 점수로 끝까지 써 냈다면 암기 완료로 연동 (이미 외운 글자는 건드리지 않는다)
      if (kana && score >= PASS_SCORE && !memorized) onToggleMemorize(kana.id);
    },
    [kana, memorized, onToggleMemorize],
  );

  return (
    <AnimatePresence>
      {kana && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${kana.char} 획순 정복`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[94dvh] w-full max-w-sm flex-col items-center overflow-y-auto rounded-3xl border border-zinc-100 bg-white p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              title="닫기"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* 1. 글자 정보: 탭을 바꿔도 변하지 않는다 */}
            <div className="mb-3 mt-1 w-full text-center">
              <div
                className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                  traceScore !== null
                    ? 'border-emerald-300 bg-emerald-600 text-white'
                    : 'border-emerald-100 bg-emerald-50 text-emerald-700'
                }`}
              >
                {traceScore !== null ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{traceScore !== null ? `통과 완료 (${traceScore}점)` : '획순 정복'}</span>
              </div>
              <h2 className="text-2xl font-black leading-none text-zinc-900">{kana.char}</h2>
              <p className="mt-1 text-xs font-semibold text-zinc-400">
                [{kana.romaji}] - {kana.korean} (총 {kana.strokeCount}획)
              </p>
            </div>

            {/* 2. 세그먼트 탭 */}
            <div
              role="tablist"
              aria-label="학습 방식"
              className="relative z-10 mb-4 grid w-full grid-cols-2 rounded-xl border border-zinc-200/60 bg-zinc-100 p-1"
            >
              {/* 활성 탭 배경 캡슐: CSS 로 미끄러진다.
                  (framer-motion layoutId 공유 레이아웃 애니메이션은 모달 퇴장 애니메이션을 붙잡아 모달이 닫히지 않는 문제가 있었다) */}
              <span
                aria-hidden
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out ${
                  activeTab === 'trace' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`relative z-10 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-colors ${
                    activeTab === id ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* 3. 모드별 콘텐츠: key 가 탭마다 달라 진입할 때마다 새로 마운트(캔버스/애니메이션 초기화) */}
            <div className="w-full">
              {/* 퇴장(exit) 애니메이션은 쓰지 않는다: 중첩된 모션 요소들 때문에 이전 탭이 1초 가까이 남아 전환이 굼뜬다 */}
              <motion.div
                key={`${kana.id}-${activeTab}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex w-full flex-col items-center"
              >
                {activeTab === 'animate' ? (
                  <StrokeAnimationView kana={kana} />
                ) : (
                  <KanaCanvasTracer kana={kana} showTitle={false} onComplete={handleTraceComplete} />
                )}
              </motion.div>
            </div>

            {/* 4. 공통 푸터 */}
            <div className="mt-4 flex w-full items-center justify-between border-t border-zinc-100 pt-3">
              <button
                type="button"
                onClick={() => speakKana(kana.char)}
                className="flex min-h-10 items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-700"
              >
                <Volume2 className="h-3.5 w-3.5" />
                발음 듣기
              </button>

              <button
                type="button"
                aria-pressed={memorized}
                onClick={() => onToggleMemorize(kana.id)}
                className={`flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${
                  memorized ? 'bg-emerald-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{memorized ? '외움 완료' : '외우기 체크'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
