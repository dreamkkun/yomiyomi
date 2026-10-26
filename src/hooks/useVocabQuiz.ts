'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QUIZ_LENGTH, QUIZ_REWARD_XP } from '@/constants/vocab';
import { useMistakeRecorder } from '@/hooks/useMistakeRecorder';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useSpeech } from '@/hooks/useSpeech';
import { useProgressStore } from '@/store/useProgressStore';
import type { QuizQuestion, Vocabulary } from '@/types/vocab';

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * 출제 단어를 섞어 최대 QUIZ_LENGTH개 고르고, 보기 4개를 구성한다.
 * 같은 카테고리에 오답 후보가 3개 미만이면 전체 단어 풀에서 무작위로 채운다.
 */
export function buildQuiz(words: Vocabulary[], pool: Vocabulary[]): QuizQuestion[] {
  return shuffle(words)
    .slice(0, QUIZ_LENGTH)
    .map((word) => {
      const wrongOf = (list: Vocabulary[]) =>
        list.filter((w) => w.id !== word.id && w.korean !== word.korean).map((w) => w.korean);

      let wrong = shuffle([...new Set(wrongOf(words))]).slice(0, 3);
      if (wrong.length < 3) {
        const extra = shuffle([...new Set(wrongOf(pool))]).filter((k) => !wrong.includes(k));
        wrong = [...wrong, ...extra].slice(0, 3);
      }
      return { word, choices: shuffle([word.korean, ...wrong]) };
    });
}

export function useVocabQuiz(words: Vocabulary[], pool: Vocabulary[]) {
  const { speak } = useSpeech();
  const { playCorrect, playWrong } = useSoundEffect();
  const addScore = useProgressStore((s) => s.addScore);
  const recordMistake = useMistakeRecorder();

  const [questions, setQuestions] = useState(() => buildQuiz(words, pool));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null); // 입력 락 겸 선택 표시
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const question = questions[index];

  const answer = useCallback(
    (choice: string) => {
      if (picked !== null || finished || !question) return;
      const correct = choice === question.word.korean;
      setPicked(choice);

      let nextScore = score;
      if (correct) {
        nextScore = score + 1;
        setScore(nextScore);
        setCombo(combo + 1);
        setBestCombo(Math.max(bestCombo, combo + 1));
        playCorrect();
        speak(question.word.japanese);
      } else {
        setCombo(0);
        playWrong();
        // 틀린 단어는 자동으로 오답 노트(SRS)에 등록된다
        const w = question.word;
        recordMistake({
          id: w.id,
          type: 'vocab',
          japanese: w.japanese,
          furigana: w.furigana,
          korean: w.korean,
          romaji: w.romaji,
          exampleSentence: w.example,
        });
      }

      // 정답·오답 모두 피드백 후 자동으로 다음 문제로 (오답은 600ms)
      timer.current = setTimeout(() => {
        setPicked(null);
        if (index + 1 < questions.length) {
          setIndex(index + 1);
        } else {
          setFinished(true);
          addScore(QUIZ_REWARD_XP);
        }
      }, correct ? 750 : 600);
    },
    [picked, finished, question, score, combo, bestCombo, index, questions.length, speak, playCorrect, playWrong, addScore, recordMistake],
  );

  const restart = useCallback(() => {
    clearTimeout(timer.current);
    setQuestions(buildQuiz(words, pool));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setFinished(false);
  }, [words, pool]);

  return {
    question,
    total: questions.length,
    index,
    picked,
    score,
    combo,
    bestCombo,
    finished,
    accuracy: questions.length ? Math.round((score / questions.length) * 100) : 0,
    answer,
    restart,
    speak,
  };
}
