'use client';

import ProgressBar from '@/components/common/ProgressBar';
import { GROUP_TABS } from '@/constants/kana';
import type { KanaGroupType, KanaSystem } from '@/types/kana';

interface Props {
  system: KanaSystem;
  group: KanaGroupType;
  memorized: number;
  total: number;
  onSystemChange: (s: KanaSystem) => void;
  onGroupChange: (g: KanaGroupType) => void;
}

const SYSTEMS: { id: KanaSystem; label: string }[] = [
  { id: 'hiragana', label: '히라가나' },
  { id: 'katakana', label: '가타카나' },
];

export default function KanaHeader({ system, group, memorized, total, onSystemChange, onGroupChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">50 Sounds Mastery</span>
          <h1 className="text-lg font-bold text-zinc-900">문자 학습 (50음도)</h1>
        </div>

        <div role="tablist" aria-label="문자 체계" className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={system === s.id}
              onClick={() => onSystemChange(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                system === s.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="문자 분류" className="flex gap-2">
        {GROUP_TABS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={group === g.id}
            onClick={() => onGroupChange(g.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              group === g.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <ProgressBar value={memorized} max={total} label="외운 글자 수" />
    </div>
  );
}
