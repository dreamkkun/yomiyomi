export type KanaSystem = 'hiragana' | 'katakana';
export type KanaToneGroup = 'seion' | 'dakuon' | 'handakuon' | 'yoon'; // 청음, 탁음, 반탁음, 요음

/** 화면에서 쓰는 분류 탭: 탁음과 반탁음은 한 탭으로 묶는다 */
export type KanaGroupType = 'seion' | 'dakuon' | 'yoon';

export interface StrokePath {
  order: number; // 획순 (1부터 시작)
  d: string; // SVG path 커맨드 (viewBox 0 0 100 100, 절대좌표 M/L/C)
  label?: { x: number; y: number }; // 획순 번호를 표시할 위치
}

export interface KanaStrokeItem {
  id: string; // 예: "h_a", "k_ka", "h_ga"
  system: KanaSystem;
  tone: KanaToneGroup;
  char: string; // 예: "あ", "が", "カ", "きゃ"
  romaji: string;
  korean: string;
  row: string; // "a", "ka", ... "pa", 요음은 "kya" 등
  column: 'a' | 'i' | 'u' | 'e' | 'o' | 'n'; // ん은 'n'
  strokeCount: number;
  strokes: StrokePath[];
}

export type KanaCharacter = KanaStrokeItem;
export type MatrixCell = KanaStrokeItem | null;

export interface Point {
  x: number;
  y: number;
}

/** 한 획을 따라 쓴 결과 */
export interface TraceEvaluation {
  strokeOrder: number;
  score: number; // 0~100
  isPassed: boolean;
}

export type ModalTabMode = 'animate' | 'trace';
