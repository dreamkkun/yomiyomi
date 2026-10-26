'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VocabCard from '@/components/vocab/VocabCard';
import type { Vocabulary } from '@/types/vocab';

interface Props {
  word: Vocabulary;
  index: number;
  total: number;
  flipped: boolean;
  memorized: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleMemorize: () => void;
  onSpeak: (text: string) => void;
}

const SWIPE_THRESHOLD = 80;

export default function FlashcardDeck({
  word,
  index,
  total,
  flipped,
  memorized,
  onFlip,
  onPrev,
  onNext,
  onToggleMemorize,
  onSpeak,
}: Props) {
  // 키보드 좌우 화살표로도 이동
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPrev, onNext]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <div className="mb-2 flex w-full items-center justify-between px-1 text-xs font-semibold text-zinc-500">
        <span>단어 진도</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>

      {/* 좌우 스와이프로 이전/다음 단어 이동 */}
      <motion.div
        drag="x"
        dragSnapToOrigin
        dragElastic={0.5}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE_THRESHOLD) onNext();
          else if (info.offset.x > SWIPE_THRESHOLD) onPrev();
        }}
        className="flex w-full justify-center"
        style={{ touchAction: 'pan-y' }}
      >
        <VocabCard
          word={word}
          flipped={flipped}
          memorized={memorized}
          onFlip={onFlip}
          onToggleMemorize={onToggleMemorize}
          onSpeak={onSpeak}
        />
      </motion.div>

      <div className="mt-6 flex w-full items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl border border-zinc-200 bg-white text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-100 active:scale-[0.98]"
        >
          <ChevronLeft className="h-4 w-4" /> 이전 단어
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          다음 단어 <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
