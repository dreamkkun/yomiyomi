import type { Badge, MiniGameRecord } from './progress';
import type { SrsItem } from './srs';

export interface QuizOption {
  blankWord: string;
  choices: string[];
}

export interface DialogueLine {
  speaker: 'npc' | 'user';
  japanese: string;
  furigana: string;
  korean: string;
  audioPrompt?: string;
  quizOption?: QuizOption;
}

export interface DialogueScenario {
  id: string;
  title: string;
  situation: string;
  dialogue: DialogueLine[];
}

export interface UserProgressState {
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  completedChars: string[];
  completedScenarioIds: string[];
  memorizedWordIds: string[];
  masteredPatternIds: string[];
  miniGameStats: { kanaMatch: MiniGameRecord };
  srsItems: Record<string, SrsItem>;
  badges: Badge[];
  totalScore: number; // 누적 경험치(XP)
}
