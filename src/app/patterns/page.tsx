'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Blocks, Sparkles } from 'lucide-react';
import Header from '@/components/common/Header';
import ProgressBar from '@/components/common/ProgressBar';
import Toast from '@/components/common/Toast';
import ChunkDropZone from '@/components/patterns/ChunkDropZone';
import PatternCompletionModal from '@/components/patterns/PatternCompletionModal';
import PatternExplainCard from '@/components/patterns/PatternExplainCard';
import PatternSelector from '@/components/patterns/PatternSelector';
import WordChunkBank from '@/components/patterns/WordChunkBank';
import { usePatternBuilder } from '@/hooks/usePatternBuilder';
import { useProgressStore } from '@/store/useProgressStore';
import dialogues from '@/data/dialogues.json';
import type { ScenarioPreview } from '@/types/pattern';
import type { DialogueScenario } from '@/types';
import { LayoutGroup } from 'framer-motion';

const STEP_LABELS = ['슬롯 단어 갈아끼우기', '어순 배열', '한국어 보고 문장 완성'] as const;
const SITUATION_TAGS: Record<string, string> = {
  scenario_restaurant: '식당',
  scenario_hotel: '호텔',
  scenario_directions: '길 찾기',
};

export default function PatternsPage() {
  const router = useRouter();
  const builder = usePatternBuilder();
  const { pattern, round, step, status } = builder;

  const [ready, setReady] = useState(false);
  const masteredIds = useProgressStore((s) => s.masteredPatternIds);
  useEffect(() => {
    Promise.resolve(useProgressStore.persist.rehydrate()).then(() => setReady(true));
  }, []);
  const mastered = ready ? masteredIds : [];

  // 연결된 롤플레잉 시나리오 정보를 dialogues.json 에서 조회해 모달 카드에 바인딩한다
  const scenario: ScenarioPreview = useMemo(() => {
    const found = (dialogues as DialogueScenario[]).find((s) => s.id === pattern.relatedScenarioId);
    return {
      id: pattern.relatedScenarioId,
      title: found?.title ?? '실전 롤플레잉',
      situation: SITUATION_TAGS[pattern.relatedScenarioId] ?? found?.situation ?? '회화',
      highlightExpression: `~${pattern.fixedSuffix.japanese.replace(/[。？！]/g, '')}`,
    };
  }, [pattern]);

  const done = builder.mastery !== null;
  const slotsFilled = builder.isFull;

  return (
    <>
      <Header ready={ready} />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-50 p-1.5 text-emerald-600">
            <Blocks className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sentence Bridge</span>
            <h1 className="text-base font-black text-zinc-900">기초 문형 조립하기</h1>
          </div>
        </div>

        <PatternSelector
          patterns={builder.patterns}
          currentIndex={builder.patternIndex}
          masteredIds={mastered}
          onSelect={builder.selectPattern}
        />

        <ProgressBar value={mastered.filter((id) => builder.patterns.some((p) => p.id === id)).length} max={builder.patterns.length} label="문형 마스터 진도" />

        {/* 3단계 스텝 인디케이터 */}
        <ol className="grid grid-cols-3 gap-2" aria-label="진행 단계">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const state = n < step || (n === step && status === 'correct') ? 'done' : n === step ? 'now' : 'todo';
            return (
              <li
                key={label}
                aria-current={n === step ? 'step' : undefined}
                className={`rounded-xl border px-2 py-1.5 text-center ${
                  state === 'done'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : state === 'now'
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-400'
                }`}
              >
                <span className="block text-[10px] font-bold">Step {n}/3</span>
                <span className="block truncate text-[10px]">{label}</span>
              </li>
            );
          })}
        </ol>

        <PatternExplainCard pattern={pattern} />

        {round && (
          // 라운드마다 레이아웃 그룹을 분리해 이전 라운드의 블록 위치가 섞이지 않게 한다
          <LayoutGroup id={`${pattern.id}-${step}-${round.pool.map((b) => b.id).join('')}`}>
            <ChunkDropZone
              slots={builder.placed}
              staticSuffix={round.staticSuffix ? pattern.fixedSuffix.furigana : null}
              status={status}
              hint={builder.prompt ? `한국어: ${builder.prompt}` : step === 2 ? '올바른 어순으로 배열하세요' : pattern.patternMeaning}
              translation={builder.koreanSentence}
              previewJapanese={builder.previewJapanese}
              onTapSlot={builder.tapSlot}
              onSpeak={builder.speak}
            />

            <WordChunkBank blocks={builder.poolBlocks} disabled={status !== 'idle'} onTap={builder.tapPoolBlock} />
          </LayoutGroup>
        )}

        {status === 'wrong' && (
          <p role="alert" className="text-center text-xs font-semibold text-rose-500">
            {step === 1 ? '이 문형에 어울리지 않는 단어예요. 다른 단어를 끼워 보세요!' : '순서나 단어가 달라요. 블록이 제자리로 돌아갔어요 — 다시 도전!'}
          </p>
        )}

        {status === 'correct' && step < 3 ? (
          <button
            type="button"
            onClick={builder.nextStep}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4" />
            <span>정답! 다음 단계로 (Step {step + 1}/3)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={builder.verify}
            disabled={!slotsFilled || status !== 'idle' || done}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition-all ${
              slotsFilled && status === 'idle' && !done
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.99]'
                : 'cursor-not-allowed bg-zinc-200 text-zinc-400'
            }`}
          >
            <span>문장 완성하기</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </main>

      <PatternCompletionModal
        isOpen={done}
        earnedXp={builder.mastery?.earnedXp ?? 0}
        scenario={scenario}
        onRestart={builder.retryPattern}
        onNextPattern={builder.nextPattern}
        onStartRoleplay={(id) => router.push(`/conversation/${id}`)}
      />
      <Toast />
    </>
  );
}
