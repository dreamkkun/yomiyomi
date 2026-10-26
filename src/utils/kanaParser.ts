import masterData from '@/data/kanaStrokesMaster.json';
import type { KanaGroupType, KanaStrokeItem, KanaSystem, KanaToneGroup, MatrixCell } from '@/types/kana';

export const KANA_ITEMS = masterData as KanaStrokeItem[];

const ITEM_BY_ID = new Map(KANA_ITEMS.map((k) => [k.id, k]));

export const getKanaById = (id: string) => ITEM_BY_ID.get(id);

export const getKanaBySystem = (system: KanaSystem) => KANA_ITEMS.filter((k) => k.system === system);

export const getKanaByTone = (system: KanaSystem, tone: KanaToneGroup) =>
  KANA_ITEMS.filter((k) => k.system === system && k.tone === tone);

/** 화면 분류(탁음 탭 = 탁음 + 반탁음)에 해당하는 문자 */
export const getKanaByGroup = (system: KanaSystem, group: KanaGroupType) =>
  getKanaBySystem(system).filter((k) =>
    group === 'dakuon' ? k.tone === 'dakuon' || k.tone === 'handakuon' : k.tone === group,
  );

const FIVE_COLUMNS = ['a', 'i', 'u', 'e', 'o'] as const;
const YOON_COLUMNS = ['a', 'u', 'o'] as const; // ゃ ゅ ょ

export interface MatrixRow {
  key: string;
  label: string;
  cells: MatrixCell[]; // 열 순서대로, 문자가 없는 칸은 null (플레이스홀더)
}

/** 선택한 문자 체계/분류의 문자를 행(row) x 단(column) 격자로 정리한다 */
export function buildMatrix(system: KanaSystem, group: KanaGroupType) {
  const columns: readonly string[] = group === 'yoon' ? YOON_COLUMNS : FIVE_COLUMNS;
  const chars = getKanaByGroup(system, group);

  const rows: MatrixRow[] = [...new Set(chars.map((c) => c.row))].map((key) => {
    const inRow = chars.filter((c) => c.row === key);
    return {
      key,
      label: `${inRow[0].char[0]}행`,
      // 'n'(ん)처럼 5단에 속하지 않는 문자는 첫 칸에 둔다
      cells: columns.map((col, i) => inRow.find((c) => c.column === col || (c.column === 'n' && i === 0)) ?? null),
    };
  });

  return { columnCount: columns.length, rows, total: chars.length, ids: chars.map((c) => c.id) };
}
