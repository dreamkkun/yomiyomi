'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Toast from '@/components/common/Toast';
import DueReviewBanner from '@/components/review/DueReviewBanner';
import FlashcardDeck from '@/components/vocab/FlashcardDeck';
import VocabCategoryTabs from '@/components/vocab/VocabCategoryTabs';
import VocabProgressBar from '@/components/vocab/VocabProgressBar';
import VocabQuickQuiz from '@/components/vocab/VocabQuickQuiz';
import { ALL_WORDS, useVocabStudy } from '@/hooks/useVocabStudy';
import { useSpeech } from '@/hooks/useSpeech';

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs font-bold text-zinc-600"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-300'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export default function VocabPage() {
  const study = useVocabStudy();
  const { speak } = useSpeech();
  const [quizMode, setQuizMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // 카드 모드에서 다른 단어로 넘어가면 자동 발음(옵션)
  const currentId = study.current?.id;
  useEffect(() => {
    if (autoSpeak && !quizMode && study.current) speak(study.current.japanese);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, autoSpeak, quizMode]);

  return (
    <>
      <Header ready={study.ready} />
      <main className="mx-auto max-w-2xl px-4 py-4">
        <DueReviewBanner className="mb-5" />
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Vocabulary Study
            </span>
            <h1 className="text-lg font-bold text-zinc-900">테마별 필수 단어장</h1>
          </div>
          <Switch label="퀴즈 모드" checked={quizMode} onChange={setQuizMode} />
        </div>

        <VocabCategoryTabs selected={study.category} onSelect={study.selectCategory} />

        <div className="my-4">
          <VocabProgressBar category={study.category} memorized={study.memorizedCount} total={study.words.length} />
        </div>

        <div className="flex flex-col items-center">
          {quizMode ? (
            <VocabQuickQuiz
              key={study.category}
              words={study.words}
              pool={ALL_WORDS}
              onExit={() => setQuizMode(false)}
            />
          ) : (
            study.current && (
              <>
                <div className="mb-3 self-end">
                  <Switch label="자동 발음" checked={autoSpeak} onChange={setAutoSpeak} />
                </div>
                <FlashcardDeck
                  word={study.current}
                  index={study.index}
                  total={study.words.length}
                  flipped={study.flipped}
                  memorized={study.memorizedSet.has(study.current.id)}
                  onFlip={study.toggleFlip}
                  onPrev={study.prev}
                  onNext={study.next}
                  onToggleMemorize={() => study.current && study.toggleMemorize(study.current.id)}
                  onSpeak={speak}
                />
              </>
            )
          )}
        </div>
      </main>
      <Toast />
    </>
  );
}
