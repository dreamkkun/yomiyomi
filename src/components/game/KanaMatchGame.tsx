'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Toast from '@/components/common/Toast';
import GameHeader from '@/components/game/GameHeader';
import GameResultModal from '@/components/game/GameResultModal';
import MatchCard from '@/components/game/MatchCard';
import { useGameSound } from '@/hooks/useGameSound';
import { useKanaMatchEngine } from '@/hooks/useKanaMatchEngine';
import { useProgressStore } from '@/store/useProgressStore';
import type { MatchScript } from '@/types/matchGame';

const SCRIPTS: { id: MatchScript; label: string }[] = [
  { id: 'hiragana', label: '히라가나' },
  { id: 'katakana', label: '가타카나' },
];

export default function KanaMatchGame() {
  const [script, setScript] = useState<MatchScript>('hiragana');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  const sound = useGameSound(soundEnabled);
  const engine = useKanaMatchEngine(script, sound);
  const bestScore = useProgressStore((s) => s.miniGameStats.kanaMatch.highScore);
  const { stats } = engine;

  useEffect(() => {
    Promise.resolve(useProgressStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 ${stats.isFever ? 'bg-amber-50/60' : 'bg-slate-50'}`}
    >
      {/* 피버 모드: 화면 테두리 글로우 (콘텐츠가 깜빡이지 않도록 별도 오버레이만 펄스) */}
      {stats.isFever && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-30 animate-pulse shadow-[inset_0_0_20px_rgba(245,158,11,0.3)]"
        />
      )}

      <GameHeader
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((v) => !v)}
        onRestart={engine.restart}
      />

      <main className="relative flex flex-col items-center p-4">
        <div className="mb-4 flex w-full max-w-sm items-center justify-between">
          <Link href="/kana" className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <ArrowLeft className="h-4 w-4" /> 문자 학습
          </Link>
          <div role="tablist" aria-label="문자 체계" className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
            {SCRIPTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={script === s.id}
                onClick={() => setScript(s.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  script === s.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-3 text-center text-[11px] text-zinc-500">
          문자 카드와 발음 카드를 짝지어 보세요 · 3콤보부터 피버(점수 x2.0)
          {ready && bestScore > 0 && <span className="ml-1 font-bold text-amber-600">· 최고 {bestScore.toLocaleString()}P</span>}
        </p>

        <div className="grid aspect-square w-full max-w-sm grid-cols-4 gap-2.5 sm:gap-3">
          {engine.cards.map((card) => (
            <MatchCard
              key={card.uid}
              card={card}
              mismatch={engine.mismatchUids.includes(card.uid)}
              onSelect={engine.selectCard}
            />
          ))}
        </div>

        {/* 콤보 팝업 */}
        <AnimatePresence>
          {engine.comboPopup && (
            <motion.div
              key={engine.comboPopup.key}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -20 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2 text-lg font-black text-white shadow-lg">
                +{engine.comboPopup.value} COMBO{stats.isFever ? ' · FEVER x2.0' : ''}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <GameResultModal stats={stats} reward={engine.reward} onRestart={engine.restart} />
      <Toast />
    </div>
  );
}
