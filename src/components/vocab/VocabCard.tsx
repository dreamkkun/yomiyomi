'use client';

import { motion } from 'framer-motion';
import { Check, RotateCw, Volume2 } from 'lucide-react';
import RubyText from '@/components/common/RubyText';
import { categoryLabel } from '@/constants/vocab';
import type { Vocabulary } from '@/types/vocab';

interface Props {
  word: Vocabulary;
  flipped: boolean;
  memorized: boolean;
  onFlip: () => void;
  onToggleMemorize: () => void;
  onSpeak: (text: string) => void;
}

const face =
  'absolute inset-0 flex h-full w-full flex-col justify-between rounded-3xl border p-6 shadow-sm [backface-visibility:hidden]';

export default function VocabCard({ word, flipped, memorized, onFlip, onToggleMemorize, onSpeak }: Props) {
  return (
    <div className="h-72 w-full max-w-sm cursor-pointer select-none [perspective:1000px]">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={flipped ? '카드 앞면으로 뒤집기' : '카드 뒤집어 뜻 확인'}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
      >
        {/* 앞면: 일본어 */}
        <div className={`${face} border-zinc-200 bg-white`}>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              {categoryLabel(word.category)}
            </span>
            <div className="flex items-center gap-1">
              {memorized && <Check className="h-4 w-4 text-emerald-500" aria-label="암기 완료" />}
              <button
                type="button"
                title="발음 듣기"
                aria-label="발음 듣기"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(word.japanese);
                }}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-emerald-600"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="py-4 text-center">
            <div className="text-[32px] font-extrabold leading-[1.85] tracking-wide text-zinc-900">
              <RubyText htmlContent={word.furigana} />
            </div>
            <p className="mt-1 text-xs font-medium tracking-wider text-zinc-400">{word.romaji}</p>
          </div>

          <div className="flex items-center gap-1 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
            <RotateCw className="h-3.5 w-3.5" /> 탭하여 뒤집기
          </div>
        </div>

        {/* 뒷면: 한국어 뜻과 예문 */}
        <div className={`${face} border-emerald-200 bg-emerald-50 [transform:rotateY(180deg)]`}>
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800">
              한국어 해석
            </span>
            <button
              type="button"
              title="예문 듣기"
              aria-label="예문 듣기"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(word.example.jp);
              }}
              className="rounded-full p-2 text-emerald-600 transition-colors hover:bg-white/60 hover:text-emerald-800"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center">
            <h3 className="text-[22px] font-black text-emerald-950">{word.korean}</h3>
            <p className="mt-0.5 text-xs text-emerald-700/70">{word.romaji}</p>
            <div className="mt-3 rounded-2xl border border-emerald-100/60 bg-white/80 p-3 text-left">
              <p className="text-xs font-semibold text-zinc-800">{word.example.jp}</p>
              <p className="mt-1 text-[11px] text-zinc-500">{word.example.kr}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-emerald-200/60 pt-3 text-xs text-emerald-700">
            <span className="flex items-center gap-1 font-medium">
              <RotateCw className="h-3.5 w-3.5" /> 탭하여 앞면으로
            </span>
            <button
              type="button"
              aria-pressed={memorized}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMemorize();
              }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                memorized
                  ? 'bg-emerald-600 text-white'
                  : 'border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Check className="h-3 w-3 stroke-[2.5]" />
              {memorized ? '암기 완료' : '암기 완료로 표시'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
