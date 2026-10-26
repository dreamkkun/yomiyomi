export type SrsItemType = 'kana' | 'vocab' | 'dialogue';
export type SrsRating = 'again' | 'good' | 'easy'; // SM-2 품질 1, 3, 5

export interface SrsItem {
  id: string; // 원본 아이템 ID (예: "v_rest_01", "h_a", "scenario_hotel#3")
  type: SrsItemType;
  japanese: string;
  furigana: string; // <ruby>…</ruby> 마크업 (가나는 글자 그대로)
  korean: string;
  romaji?: string;
  exampleSentence?: {
    jp: string;
    kr: string;
  };
  /** 회화 빈칸 퀴즈 오답: 카드 앞면에서 이 단어를 [ ? ]로 가려 다시 떠올리게 한다 */
  blankWord?: string;

  // SRS 메타데이터
  repetitions: number; // 연속 성공 횟수 (기본 0)
  interval: number; // 다음 복습까지의 일수 (기본 1)
  easeFactor: number; // 난이도 계수 (기본 2.5, 최저 1.3)
  nextReviewDate: string; // YYYY-MM-DD (로컬 날짜)
  lastReviewedAt: string | null;
  mistakeCount: number; // 누적 오답 횟수
}

/** 오답을 처음 등록할 때 호출부가 넘기는 값: SRS 메타데이터는 스토어가 채운다 */
export type SrsItemInput = Pick<
  SrsItem,
  'id' | 'type' | 'japanese' | 'furigana' | 'korean' | 'romaji' | 'exampleSentence' | 'blankWord'
>;

export interface SrsSessionResult {
  totalReviewed: number;
  graduatedCount: number; // interval 이 14일 이상에 도달한 카드 수
  earnedXp: number;
}

export interface DueReviewBannerProps {
  className?: string;
  /** 복습 대기 카드가 0개일 때 "오늘 복습 완료" 배너를 보여 줄지 (기본: false, 아무것도 그리지 않음) */
  showAllCompletedState?: boolean;
  /** 이동 직전에 호출되는 추가 콜백 */
  onNavigate?: () => void;
}
