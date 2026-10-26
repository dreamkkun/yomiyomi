export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // 이모지
  requirementText: string; // 달성 조건 설명
  unlockedAt?: string; // YYYY-MM-DD, 미획득 시 undefined
}

export interface ScenarioReward {
  earnedXp: number;
  newBadge: Badge | null;
  isStreakIncremented: boolean;
  streakDays: number;
  isReview: boolean; // 이미 완료한 시나리오를 다시 마친 경우
}

export interface UserStats {
  totalXp: number;
  streakDays: number;
  completedScenarioCount: number;
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelProgressPercent: number;
}

export type MiniGameId = 'kanaMatch';

export interface MiniGameRecord {
  highScore: number;
  gamesPlayed: number;
  gamesCleared: number;
  lastPlayedAt: string | null;
}

/** completeMiniGame 이 돌려주는 정산 결과: 결과 모달의 XP 카운트업/뱃지 알림에 쓴다 */
export interface MiniGameRewardResult {
  earnedXp: number;
  finalScore: number;
  isCleared: boolean;
  isNewHighScore: boolean;
  highScore: number;
  isStreakIncremented: boolean;
  newBadges: Badge[];
  previousTotalXp: number;
  currentTotalXp: number;
  currentLevel: number;
}
