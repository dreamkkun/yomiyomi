'use client';

import { useEffect, useRef, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Toast from '@/components/common/Toast';
import DialogueBubble from '@/components/conversation/DialogueBubble';
import QuizOptionSelector from '@/components/conversation/QuizOptionSelector';
import RewardModal from '@/components/conversation/RewardModal';
import RoleplayHeader from '@/components/conversation/RoleplayHeader';
import { useRoleplayEngine } from '@/hooks/useRoleplayEngine';
import { useProgressStore } from '@/store/useProgressStore';
import scenariosData from '@/data/dialogues.json';
import type { DialogueScenario } from '@/types';

const scenarios = scenariosData as DialogueScenario[];

export default function RoleplayPage({ params }: { params: { id: string } }) {
  const index = scenarios.findIndex((s) => s.id === params.id);
  if (index < 0) notFound();
  const scenario = scenarios[index];
  const router = useRouter();

  const [opts, setOpts] = useState({
    showFurigana: true,
    showTranslation: true,
    autoSpeak: true,
    autoAdvance: false,
  });
  const engine = useRoleplayEngine(scenario, { autoSpeak: opts.autoSpeak, autoAdvance: opts.autoAdvance });
  const { line, step, completed } = engine;

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useProgressStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step, completed, engine.correctChoice]);

  const quizActive = !completed && line.speaker === 'user' && !!line.quizOption && !engine.correctChoice;

  return (
    <div className="mx-auto flex h-[100dvh] max-w-2xl flex-col border-x border-zinc-200 bg-slate-50">
      <RoleplayHeader
        scenario={scenario}
        progress={engine.progress}
        {...opts}
        onChange={(patch) => setOpts((o) => ({ ...o, ...patch }))}
        onReset={engine.reset}
      />

      <main
        className={`flex-1 space-y-4 overflow-y-auto p-4 ${!opts.showFurigana ? 'hide-furigana' : ''}`}
      >
        {scenario.dialogue.slice(0, step + 1).map((l, i) => (
          <DialogueBubble
            key={`${scenario.id}-${i}`}
            line={l}
            showTranslation={opts.showTranslation}
            masked={i === step && quizActive}
          />
        ))}

        <div ref={bottomRef} />
      </main>

      <RewardModal
        isOpen={completed}
        reward={engine.reward}
        onRestart={engine.reset}
        onGoHome={() => router.push('/conversation')}
      />

      {!completed && (
        <footer className="sticky bottom-0 border-t border-zinc-200 bg-white p-4">
          {line.speaker === 'npc' ? (
            <button
              type="button"
              onClick={engine.proceedNpc}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.99]"
            >
              <span>다음 대화 듣기</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : line.quizOption ? (
            <QuizOptionSelector
              quiz={line.quizOption}
              correctChoice={engine.correctChoice}
              wrongChoice={engine.wrongChoice}
              onChoose={engine.choose}
            />
          ) : (
            <button
              type="button"
              onClick={engine.proceedNpc}
              className="w-full rounded-xl bg-zinc-900 py-3.5 font-semibold text-white"
            >
              다음
            </button>
          )}
        </footer>
      )}
      <Toast />
    </div>
  );
}
