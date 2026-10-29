export interface WordChunk {
  id: string;
  japanese: string;
  furigana: string;
  korean: string;
  romaji: string;
}

export type PatternSlotType = 'noun_place' | 'noun_item' | 'verb_stem';

export interface PatternExercise {
  id: string;
  patternFormula: string; // 예: "[장소] + はどこですか？"
  patternMeaning: string; // 예: "~은/는 어디인가요?"
  grammarTip: string;
  fixedSuffix: {
    japanese: string;
    furigana: string;
  };
  /** 고정 접미사를 (조사 / 서술어)로 나눈 조각: 2·3단계에서 어순 블록으로 쓴다 */
  suffixParts: { japanese: string; furigana: string }[];
  /** 3단계의 오답 방해용 조사 */
  wrongParticles: string[];
  /** 한국어 번역 틀: {N} 은 단어, {N:은/는} 처럼 쓰면 받침에 맞는 조사가 붙는다 */
  koreanTemplate: string;
  slotType: PatternSlotType;
  correctChunks: WordChunk[]; // 올바른 대입 단어 후보들
  distractorChunks: WordChunk[]; // 오답 방해 블록들
  relatedScenarioId: string; // 연결되는 롤플레잉 ID (예: "scenario_restaurant")
}

export type PatternStep = 1 | 2 | 3;
export type PatternBlockKind = 'noun' | 'particle' | 'predicate';

/** 화면에서 옮겨 다니는 블록 한 개 */
export interface PatternBlock {
  id: string;
  japanese: string;
  furigana: string;
  kind: PatternBlockKind;
  korean?: string;
  romaji?: string;
}

/** 한 단계(라운드)의 문제 구성 */
export interface PatternRound {
  step: PatternStep;
  slotCount: number;
  pool: PatternBlock[]; // 섞인 블록 풀
  validIds?: string[]; // 1단계: 슬롯에 들어가도 되는 단어
  solution?: string[]; // 2·3단계: 슬롯 순서대로의 정답 블록 id
  targetNoun: WordChunk; // 2·3단계의 기준 단어 (1단계는 사용자가 고른 단어)
  staticSuffix: boolean; // 1단계: 접미사를 고정 텍스트로 보여 준다
}

export interface ScenarioPreview {
  id: string;
  title: string;
  situation: string; // 상황 태그 (예: "식당")
  highlightExpression: string; // 예: "~をください"
}

export interface PatternCompletionModalProps {
  isOpen: boolean;
  earnedXp: number; // 0 이면 이미 마스터했던 문형을 복습한 경우
  scenario: ScenarioPreview;
  onRestart: () => void;
  onNextPattern?: () => void;
  onStartRoleplay: (scenarioId: string) => void;
}
