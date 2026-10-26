'use client';

import KanaCell from '@/components/kana/KanaCell';
import type { MatrixRow } from '@/utils/kanaParser';
import type { KanaStrokeItem } from '@/types/kana';

interface Props {
  rows: MatrixRow[];
  columnCount: number;
  memorizedIds: Set<string>;
  onSelect: (kana: KanaStrokeItem) => void;
}

// Tailwind는 클래스를 정적으로 찾아내므로 열 수별 클래스를 미리 적어 둔다
const GRID_COLS: Record<number, string> = { 3: 'grid-cols-3', 5: 'grid-cols-5' };

export default function KanaMatrix({ rows, columnCount, memorizedIds, onSelect }: Props) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="flex items-stretch gap-2">
          <div className="flex w-9 shrink-0 items-center justify-center text-[11px] font-bold text-zinc-400">
            {row.label}
          </div>
          <div className={`grid flex-1 gap-2 ${GRID_COLS[columnCount] ?? 'grid-cols-5'}`}>
            {row.cells.map((kana, i) => (
              <KanaCell
                key={kana?.id ?? `${row.key}-empty-${i}`}
                kana={kana}
                memorized={kana ? memorizedIds.has(kana.id) : false}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
