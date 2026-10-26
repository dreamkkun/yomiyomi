'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, Eye, EyeOff, PartyPopper } from 'lucide-react';
import Header from '@/components/common/Header';
import Toast from '@/components/common/Toast';
import ReviewCompletionModal from '@/components/review/ReviewCompletionModal';
import SrsFlashcard from '@/components/review/SrsFlashcard';
import SrsProgressGauge from '@/components/review/SrsProgressGauge';
import { useSpeech } from '@/hooks/useSpeech';
import { previewIntervals, useSrsEngine } from '@/hooks/useSrsEngine';
import { useProgressStore } from '@/store/useProgressStore';

export default function SrsReviewPage() {
  const engine = useSrsEngine();
  const { speak } = useSpeech();
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);

  const { session, currentCard } = engine;
  // 큐에 담긴 카드 스냅샷 대신 스토어의 최신 SRS 값으로 다음 간격을 계산한다
  const latest = useProgressStore((s) => (currentCard ? s.srsItems[currentCard.id] : undefined));

  const handleRate = (rating: Parameters<typeof engine.rate>[0]) => {
    setFlipped(false);
    engine.rate(rating);
  };

  return (
    <>
      <Header ready={engine.ready} />
      <main className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-50 p-1.5 text-emerald-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-zinc-900">오늘의 오답 복습</h1>
              <p className="text-[11px] font-medium text-zinc-400">망각곡선(SM-2) 간격 반복</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showFurigana}
            onClick={() => setShowFurigana((v) => !v)}
            className={`flex min-h-10 items-center gap-1 rounded-full border px-3 text-xs transition-colors ${
              showFurigana ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-300 bg-white text-zinc-500'
            }`}
          >
            {showFurigana ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            후리가나
          </button>
        </div>

        {!session ? (
          <p className="py-20 text-center text-sm text-zinc-400">복습 덱을 준비하는 중…</p>
        ) : engine.isEmpty ? (
          <div className="space-y-4">
            <SrsProgressGauge completed={0} total={0} mastery={engine.mastery} />
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <PartyPopper className="mx-auto mb-2 h-12 w-12 text-emerald-500" />
              <h2 className="text-lg font-black text-zinc-900">오늘 복습할 카드가 없어요</h2>
              <p className="mb-5 mt-1 text-xs text-zinc-500">
                퀴즈나 회화, 짝맞추기에서 틀린 문제는 자동으로 이곳에 모여요.
              </p>
              <div className="flex gap-2.5">
                <Link href="/vocab" className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-200">
                  단어 퀴즈
                </Link>
                <Link href="/conversation" className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700">
                  회화 연습
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <SrsProgressGauge completed={session.completed} total={session.total} mastery={engine.mastery} />
            {currentCard && (
              <SrsFlashcard
                key={`${currentCard.id}-${session.completed}-${session.queue.length}`}
                item={currentCard}
                flipped={flipped}
                showFurigana={showFurigana}
                intervals={previewIntervals(latest ?? currentCard)}
                onFlip={() => setFlipped((f) => !f)}
                onSpeak={speak}
                onRate={handleRate}
              />
            )}
          </div>
        )}
      </main>

      <ReviewCompletionModal result={session?.result ?? null} />
      <Toast />
    </>
  );
}
