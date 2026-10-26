export type CardType = 'char' | 'pronunciation';

export interface MatchCardItem {
  uid: string; // 카드 고유 인스턴스 ID (예: "h_a_char", "h_a_pron")
  pairId: string; // 매칭 대상 식별 키 (예: "h_a")
  type: CardType; // 문자 표기 or 발음 표기
  display: string; // 화면 노출 텍스트 (예: "あ" or "a")
  subText?: string; // 보조 텍스트 (한글 독음)
  isMatched: boolean; // 매칭 성공 여부
  isFlipped: boolean; // 현재 선택(오픈)되어 있는지
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  matchedPairs: number;
  totalPairs: number;
  timeLeft: number;
  isFever: boolean;
  isGameOver: boolean;
  isCleared: boolean;
}

export type MatchScript = 'hiragana' | 'katakana';
