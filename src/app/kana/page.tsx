'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import Header from '@/components/common/Header';
import Toast from '@/components/common/Toast';
import KanaHeader from '@/components/kana/KanaHeader';
import DueReviewBanner from '@/components/review/DueReviewBanner';
import KanaMatrix from '@/components/kana/KanaMatrix';
import StrokeDetailModal from '@/components/kana/StrokeDetailModal';
import { buildMatrix } from '@/utils/kanaParser';
import { useKanaAudio } from '@/hooks/useKanaAudio';
import { useProgressStore } from '@/store/useProgressStore';
import type { KanaGroupType, KanaStrokeItem, KanaSystem } from '@/types/kana';

export default function KanaPage() {
  const [ready, setReady] = useState(false);
  const [system, setSystem] = useState<KanaSystem>('hiragana');
  const [group, setGroup] = useState<KanaGroupType>('seion');
  const [selectedKana, setSelectedKana] = useState<KanaStrokeItem | null>(null);

  const completedChars = useProgressStore((s) => s.completedChars);
  const toggleChar = useProgressStore((s) => s.toggleChar);
  const { speakKana } = useKanaAudio();

  useEffect(() => {
    Promise.resolve(useProgressStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  const matrix = useMemo(() => buildMatrix(system, group), [system, group]);
  const memorizedIds = useMemo(() => new Set(ready ? completedChars : []), [ready, completedChars]);
  const memorizedCount = matrix.ids.filter((id) => memorizedIds.has(id)).length;

  // 셀을 누르면 즉시 단음을 한 번 읽어 주고 획순 모달을 연다
  const handleSelect = useCallback(
    (kana: KanaStrokeItem) => {
      setSelectedKana(kana);
      speakKana(kana.char);
    },
    [speakKana],
  );
  const closeModal = useCallback(() => setSelectedKana(null), []);

  return (
    <>
      <Header ready={ready} />
      <main className="mx-auto max-w-2xl px-4 py-4">
        <DueReviewBanner className="mb-5" />

        <section className="mb-5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-4">
          <KanaHeader
            system={system}
            group={group}
            memorized={memorizedCount}
            total={matrix.total}
            onSystemChange={setSystem}
            onGroupChange={setGroup}
          />
        </section>

        <Link
          href="/game/kana-match"
          className="mb-5 flex items-center justify-between rounded-2xl border-2 border-b-4 border-amber-300 bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-700 transition hover:bg-amber-100"
        >
          <span className="flex items-center gap-2">
            <Zap size={18} className="fill-amber-500" /> 짝맞추기 미니게임 · 40초 타임어택
          </span>
          <ArrowRight size={18} />
        </Link>

        <KanaMatrix
          rows={matrix.rows}
          columnCount={matrix.columnCount}
          memorizedIds={memorizedIds}
          onSelect={handleSelect}
        />

        <p className="mt-6 text-center text-[11px] text-zinc-400">
          획순 데이터: KanjiVG (© Ulrich Apel, CC BY-SA 3.0) ·{' '}
          <a
            href="https://kanjivg.tagaini.net"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            kanjivg.tagaini.net
          </a>
        </p>
      </main>

      <StrokeDetailModal
        kana={selectedKana}
        memorized={selectedKana ? memorizedIds.has(selectedKana.id) : false}
        onClose={closeModal}
        onToggleMemorize={toggleChar}
      />
      <Toast />
    </>
  );
}
