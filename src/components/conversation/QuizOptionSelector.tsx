'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import type { QuizOption } from '@/types';

interface Props {
  quiz: QuizOption;
  correctChoice: string | null;
  wrongChoice: string | null;
  onChoose: (choice: string) => void;
}

export default function QuizOptionSelector({ quiz, correctChoice, wrongChoice, onChoose }: Props) {
  const locked = correctChoice !== null || wrongChoice !== null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-600">
          빈칸에 들어갈 알맞은 단어를 선택하세요:
        </span>
        {wrongChoice && (
          <span className="flex items-center gap-1 text-xs font-medium text-rose-500">
            <AlertCircle className="h-3.5 w-3.5" /> 다시 시도해보세요!
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quiz.choices.map((choice) => {
          const isCorrect = correctChoice === choice;
          const isWrong = wrongChoice === choice;
          return (
            <motion.button
              key={choice}
              type="button"
              onClick={() => onChoose(choice)}
              disabled={locked}
              animate={
                isWrong ? { x: [-6, 6, -4, 4, 0] } : isCorrect ? { scale: [1, 1.08, 1.04] } : { x: 0, scale: 1 }
              }
              transition={{ duration: isWrong ? 0.5 : 0.25 }}
              className={`rounded-xl border-2 px-4 py-3 text-center text-base font-bold transition-colors ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : isWrong
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-100 disabled:opacity-50'
              }`}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
