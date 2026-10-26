'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Volume2 } from 'lucide-react';
import RubyText from '@/components/common/RubyText';
import type { SrsItem, SrsRating } from '@/types/srs';

interface Props {
  item: SrsItem;
  flipped: boolean;
  showFurigana: boolean;
  /** 평가별 다음 복습까지의 일수 */
  intervals: { again: number; good: number; easy: number };
  onFlip: () => void;
  onSpeak: (text: string) => void;
  onRate: (rating: SrsRating) => void;
}

const TYPE_LABEL = { kana: '문자', vocab: '단어', dialogue: '회화' } as const;
const face =
  'absolute inset-0 flex h-full w-full flex-col justify-between rounded-3xl border p-6 shadow-sm [backface-visibility:hidden]';

export default function SrsFlashcard({ item, flipped, showFurigana, intervals, onFlip, onSpeak, onRate }: Props) {
  const isDialogue = item.type === 'dialogue';
  const frontSize = isDialogue ? 'text-xl' : 'text-4xl';

  const ratings: { id: SrsRating; label: string; hint: string; className: string }[] = [
    { id: 'again', label: '다시', hint: `오늘 다시 복습 (${intervals.again}일 뒤)`, className: 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100' },
    { id: 'good', label: '적당함', hint: `${intervals.good}일 뒤로 이동`, className: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { id: 'easy', label: '쉬움', hint: `${intervals.easy}일 뒤 (보너스 x1.3)`, className: 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100' },
  ];

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <div className={`h-80 w-full cursor-pointer select-none [perspective:1000px] ${showFurigana ? '' : 'hide-furigana'}`}>
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
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                {TYPE_LABEL[item.type]} · 오답 {item.mistakeCount}회
              </span>
              <button
                type="button"
                aria-label="발음 듣기"
                title="발음 듣기"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(item.japanese);
                }}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-emerald-600"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <div className={`${frontSize} font-extrabold leading-[1.85] text-zinc-900`}>
                {/* 회화 빈칸 오답은 그 단어를 가려서 다시 떠올리게 한다 */}
                <RubyText htmlContent={item.furigana} blank={item.blankWord} />
              </div>
              {item.romaji && <p className="mt-1 text-xs font-medium text-zinc-400">{item.romaji}</p>}
            </div>

            <div className="flex items-center justify-center gap-1.5 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>카드를 탭하여 뜻 확인하기</span>
            </div>
          </div>

          {/* 뒷면: 한국어 뜻과 예문 */}
          <div className={`${face} border-emerald-200 bg-emerald-50 [transform:rotateY(180deg)]`}>
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-emerald-100 bg-white px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                정답 및 해설
              </span>
              <button
                type="button"
                aria-label="발음 듣기"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(item.exampleSentence?.jp ?? item.japanese);
                }}
                className="rounded-full p-2 text-emerald-700 transition-colors hover:bg-white/60"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              {isDialogue && (
                <p className="mb-2 text-base font-bold leading-[1.85] text-emerald-950">
                  <RubyText htmlContent={item.furigana} />
                </p>
              )}
              <h3 className={`${isDialogue ? 'text-base' : 'text-2xl'} font-black text-emerald-950`}>{item.korean}</h3>
              {item.exampleSentence && (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/80 p-3 text-left text-xs">
                  <p className="font-semibold text-zinc-800">{item.exampleSentence.jp}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{item.exampleSentence.kr}</p>
                </div>
              )}
            </div>

            <div className="border-t border-emerald-200/60 pt-2 text-center text-[11px] font-medium text-emerald-700">
              아래 버튼으로 기억 강도를 선택하세요
            </div>
          </div>
        </motion.div>
      </div>

      {flipped ? (
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {ratings.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onRate(r.id)}
              className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 p-2 text-center transition-all active:scale-95 ${r.className}`}
            >
              <span className="text-xs font-black">{r.label}</span>
              <span className="mt-0.5 text-[10px] leading-tight opacity-80">{r.hint}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-center text-xs font-medium text-zinc-400">뜻을 떠올린 뒤 카드를 뒤집어 확인하세요</p>
      )}
    </div>
  );
}
