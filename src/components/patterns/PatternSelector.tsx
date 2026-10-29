'use client';

import { CheckCircle2 } from 'lucide-react';
import type { PatternExercise } from '@/types/pattern';

interface Props {
  patterns: PatternExercise[];
  currentIndex: number;
  masteredIds: string[];
  onSelect: (index: number) => void;
}

export default function PatternSelector({ patterns, currentIndex, masteredIds, onSelect }: Props) {
  return (
    <div role="tablist" aria-label="문형 선택" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {patterns.map((p, i) => {
        const active = i === currentIndex;
        const mastered = masteredIds.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(i)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
              active
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {mastered && <CheckCircle2 className={`h-3.5 w-3.5 ${active ? 'text-emerald-300' : 'text-emerald-500'}`} />}
            {p.patternFormula.replace('？', '')}
          </button>
        );
      })}
    </div>
  );
}
