'use client';

import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import RubyText from '@/components/common/RubyText';
import type { PatternStatus } from '@/hooks/usePatternBuilder';
import type { PatternBlock } from '@/types/pattern';

interface Props {
  slots: (PatternBlock | null)[];
  /** 1단계에서 슬롯 뒤에 고정으로 붙는 접미사 (furigana) */
  staticSuffix?: string | null;
  status: PatternStatus;
  hint: string; // 슬롯 위 안내 문구 (한국어 뜻 또는 번역 문제)
  translation: string | null; // 정답 후 보여 주는 전체 번역
  previewJapanese: string | null; // 슬롯이 다 찼을 때 소리 듣기에 쓸 문장
  onTapSlot: (index: number) => void;
  onSpeak: (text: string) => void;
}

export default function ChunkDropZone({
  slots,
  staticSuffix,
  status,
  hint,
  translation,
  previewJapanese,
  onTapSlot,
  onSpeak,
}: Props) {
  const correct = status === 'correct';

  return (
    <motion.div
      animate={status === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative flex min-h-[140px] flex-col items-center justify-between rounded-3xl border bg-white p-5 text-center shadow-sm transition-colors ${
        correct ? 'border-emerald-500 ring-4 ring-emerald-200/60' : status === 'wrong' ? 'border-rose-400' : 'border-zinc-200'
      }`}
    >
      <div className="flex w-full items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold">{hint}</span>
        {previewJapanese && (
          <button
            type="button"
            onClick={() => onSpeak(previewJapanese)}
            className="flex min-h-8 items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700"
          >
            <Volume2 className="h-4 w-4" />
            소리 듣기
          </button>
        )}
      </div>

      <div className="my-4 flex flex-wrap items-center justify-center gap-2">
        {slots.map((block, i) =>
          block ? (
            <motion.button
              key={block.id}
              layoutId={`block-${block.id}`}
              type="button"
              onClick={() => onTapSlot(i)}
              aria-label={`${block.japanese} 블록 (탭하면 되돌림)`}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="cursor-pointer rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-2 text-xl font-black text-emerald-900 shadow-sm"
            >
              <RubyText htmlContent={block.furigana} />
            </motion.button>
          ) : (
            <div
              key={`empty-${i}`}
              aria-label={`빈 슬롯 ${i + 1}`}
              className="min-w-16 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-2.5 text-sm font-bold text-emerald-600"
            >
              {slots.length > 1 ? i + 1 : '[ 단어 ]'}
            </div>
          ),
        )}
        {staticSuffix && (
          <span className="text-2xl font-black leading-none text-zinc-900">
            <RubyText htmlContent={staticSuffix} />
          </span>
        )}
      </div>

      <div className="min-h-5 text-xs font-semibold">
        {translation ? <span className="font-bold text-emerald-700">{translation}</span> : null}
      </div>
    </motion.div>
  );
}
