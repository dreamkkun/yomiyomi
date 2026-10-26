'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMistakeRecorder } from '@/hooks/useMistakeRecorder';
import { useSpeech } from '@/hooks/useSpeech';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { cancelSpeech } from '@/lib/speech';
import { useProgressStore } from '@/store/useProgressStore';
import type { DialogueScenario } from '@/types';
import type { ScenarioReward } from '@/types/progress';

interface Options {
  autoSpeak: boolean; // NPC 차례에 대사를 자동 재생
  autoAdvance: boolean; // NPC 음성 종료 600ms 후 자동 진행
}

export function useRoleplayEngine(scenario: DialogueScenario, options: Options) {
  const lines = scenario.dialogue;
  const { speak } = useSpeech();
  const { playCorrect, playWrong } = useSoundEffect();
  const addScore = useProgressStore((s) => s.addScore);
  const recordMistake = useMistakeRecorder();
  const completeScenario = useProgressStore((s) => s.completeScenario);
  const scenarioId = scenario.id;

  const [reward, setReward] = useState<ScenarioReward | null>(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const stepRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  // from 단계에서 예약된 진행만 유효: 수동 클릭과 자동 진행이 겹쳐도 한 번만 넘어간다
  const advance = useCallback(
    (from: number) => {
      if (from < 0 || stepRef.current !== from) return;
      setCorrectChoice(null);
      if (from + 1 < lines.length) {
        stepRef.current = from + 1;
        setStep(from + 1);
      } else {
        // 완료는 정확히 한 번만 기록한다 (-1: 이후의 모든 advance 무효화)
        stepRef.current = -1;
        setCompleted(true);
        setReward(completeScenario(scenarioId));
      }
    },
    [lines.length, scenarioId, completeScenario],
  );

  const line = lines[step];

  // NPC 차례: 자동 재생 / 자동 진행
  useEffect(() => {
    if (completed || line?.speaker !== 'npc') return;
    const from = step;
    const { autoSpeak, autoAdvance } = optionsRef.current;
    if (!autoSpeak && !autoAdvance) return;

    const onEnd = autoAdvance ? () => later(() => advance(from), 600) : undefined;
    const started = speak(line.audioPrompt || line.japanese, onEnd);
    if (!started && autoAdvance) later(() => advance(from), 1500);
  }, [step, completed, line, speak, advance, later]);

  // 언마운트 시 타이머와 음성 정리
  useEffect(
    () => () => {
      clearTimers();
      cancelSpeech();
    },
    [clearTimers],
  );

  const proceedNpc = useCallback(() => advance(stepRef.current), [advance]);

  const choose = useCallback(
    (choice: string) => {
      const quiz = line?.quizOption;
      // 정답 확정 중이거나 오답 흔들림(500ms) 중에는 입력 락
      if (!quiz || completed || correctChoice || wrongChoice) return;

      if (choice === quiz.blankWord) {
        const from = step;
        setCorrectChoice(choice);
        setWrongChoice(null);
        playCorrect();
        addScore(5);
        speak(line.audioPrompt || line.japanese);
        later(() => advance(from), 500);
      } else {
        setWrongChoice(choice);
        setWrongCount((c) => c + 1);
        playWrong();
        // 틀린 회화 표현은 빈칸 정보와 함께 오답 노트(SRS)에 등록된다
        recordMistake({
          id: `${scenarioId}#${step}`,
          type: 'dialogue',
          japanese: line.japanese,
          furigana: line.furigana,
          korean: line.korean,
          blankWord: quiz.blankWord,
        });
        later(() => setWrongChoice(null), 500);
      }
    },
    [line, completed, correctChoice, wrongChoice, step, speak, playCorrect, playWrong, addScore, advance, later, recordMistake, scenarioId],
  );

  const reset = useCallback(() => {
    clearTimers();
    cancelSpeech();
    stepRef.current = 0;
    setStep(0);
    setCompleted(false);
    setReward(null);
    setCorrectChoice(null);
    setWrongChoice(null);
    setWrongCount(0);
  }, [clearTimers]);

  const progress = Math.round(((step + (completed ? 1 : 0)) / lines.length) * 100);

  return {
    step,
    line,
    completed,
    reward,
    correctChoice,
    wrongChoice,
    wrongCount,
    progress,
    choose,
    proceedNpc,
    reset,
    speak,
  };
}
