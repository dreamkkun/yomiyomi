'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Volume2 } from 'lucide-react';
import RubyText from '@/components/common/RubyText';
import { QUIZ_REWARD_XP } from '@/constants/vocab';
import { useVocabQuiz } from '@/hooks/useVocabQuiz';
import type { Vocabulary } from '@/types/vocab';

interface Props {
  words: Vocabulary[]; // 현재 카테고리 단어
  pool: Vocabulary[]; // 오답 보기 보충용 전체 단어
  onExit: () => void;
}

export default function VocabQuickQuiz({ words, pool, onExit }: Props) {
  const quiz = useVocabQuiz(words, pool);

  if (quiz.finished) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900">퀴즈 완료!</h3>
        <p className="mb-4 mt-1 text-xs text-zinc-500">
          {quiz.total}문제 중 {quiz.score}문제를 맞혔습니다. 최대 콤보 {quiz.bestCombo}
        </p>
        <div className="mb-3 text-4xl font-black text-zinc-900">{quiz.accuracy}%</div>
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
          <span className="text-xs font-bold text-emerald-700">보상 획득</span>
          <div className="mt-0.5 text-xl font-black text-emerald-950">+{QUIZ_REWARD_XP} XP</div>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={quiz.restart}
            className="min-h-12 flex-1 rounded-2xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200"
          >
            다시 도전
          </button>
          <button
            type="button"
            onClick={onExit}
            className="min-h-12 flex-1 rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
          >
            카드 모드로 복귀
          </button>
        </div>
      </div>
    );
  }

  const { question, picked } = quiz;
  if (!question) return null;
  const locked = picked !== null;

  return (
    <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-xs font-bold text-zinc-400">
        <span>스피드 단어 퀴즈</span>
        <span className="flex items-center gap-3">
          {quiz.combo > 0 && (
            <motion.span
              key={quiz.combo}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-0.5 text-amber-500"
            >
              <Flame className="h-3.5 w-3.5 fill-amber-500" /> 콤보 {quiz.combo}
            </motion.span>
          )}
          <span>
            {quiz.index + 1} / {quiz.total}
          </span>
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-100 bg-slate-50 p-6 text-center">
        <div className="text-3xl font-extrabold leading-[1.85] text-zinc-900">
          <RubyText htmlContent={question.word.furigana} />
        </div>
        <button
          type="button"
          onClick={() => quiz.speak(question.word.japanese)}
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-emerald-600"
        >
          <Volume2 className="h-3.5 w-3.5" /> 발음 듣기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {question.choices.map((choice) => {
          const isCorrectChoice = choice === question.word.korean;
          const isPicked = picked === choice;
          const showCorrect = locked && isCorrectChoice; // 오답 후에도 정답을 보여 준다
          const showWrong = isPicked && !isCorrectChoice;
          return (
            <motion.button
              key={choice}
              type="button"
              disabled={locked}
              onClick={() => quiz.answer(choice)}
              animate={showWrong ? { x: [-6, 6, -4, 4, 0] } : showCorrect ? { scale: [1, 1.05, 1] } : { x: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`min-h-14 rounded-2xl border-2 px-3 py-3 text-center text-sm font-bold transition-colors ${
                showCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : showWrong
                    ? 'border-rose-500 bg-rose-50 text-rose-600'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 disabled:opacity-60'
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
