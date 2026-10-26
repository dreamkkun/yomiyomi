export type VocabCategory = 'all' | 'restaurant' | 'hotel' | 'directions' | 'basic';

export interface Vocabulary {
  id: string;
  category: Exclude<VocabCategory, 'all'>;
  japanese: string;
  furigana: string; // 예: <ruby>水<rt>みず</rt></ruby>
  romaji: string;
  korean: string;
  example: {
    jp: string;
    kr: string;
  };
}

export interface VocabProgressState {
  memorizedWordIds: string[];
  toggleMemorize: (wordId: string) => void;
  isMemorized: (wordId: string) => boolean;
}

export interface QuizQuestion {
  word: Vocabulary;
  choices: string[]; // 한국어 뜻 4개 (정답 포함, 섞인 순서)
}
