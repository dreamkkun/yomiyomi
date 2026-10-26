'use client';

import { VOCAB_CATEGORIES } from '@/constants/vocab';
import type { VocabCategory } from '@/types/vocab';

interface Props {
  selected: VocabCategory;
  onSelect: (id: VocabCategory) => void;
}

export default function VocabCategoryTabs({ selected, onSelect }: Props) {
  return (
    <div role="tablist" aria-label="단어 카테고리" className="flex gap-2 overflow-x-auto pb-1">
      {VOCAB_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={selected === cat.id}
          onClick={() => onSelect(cat.id)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            selected === cat.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
