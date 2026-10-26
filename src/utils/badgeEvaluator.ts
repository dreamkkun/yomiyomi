import type { Badge } from '@/types/progress';

// 시스템 전체 뱃지 마스터 목록
export const BADGE_CATALOG: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'first_step',
    name: '첫 걸음의 설렘',
    description: '첫 번째 롤플레잉 회화를 성공적으로 마쳤습니다.',
    icon: '🎉',
    requirementText: '회화 시나리오 1회 완료',
  },
  {
    id: 'streak_3',
    name: '작심삼일 돌파',
    description: '3일 연속으로 일본어 학습을 이어갔습니다.',
    icon: '🔥',
    requirementText: '3일 연속 학습 달성',
  },
  {
    id: 'scenario_master',
    name: '상황별 마스터',
    description: '서로 다른 여행 회화 시나리오 3개를 정복했습니다.',
    icon: '👑',
    requirementText: '3개 이상의 고유 시나리오 완료',
  },
  {
    id: 'xp_hunter',
    name: '숙련된 여행자',
    description: '누적 경험치 1,000 XP를 달성했습니다.',
    icon: '🧭',
    requirementText: '총 1,000 XP 획득',
  },
  {
    id: 'blitz_rookie',
    name: '스피드 매칭 입문',
    description: 'Kana Match Blitz 게임을 처음으로 완주했습니다.',
    icon: '⚡',
    requirementText: '짝맞추기 게임 1회 클리어',
  },
  {
    id: 'blitz_master',
    name: '매칭 마스터',
    description: 'Kana Match Blitz에서 3,000점 이상의 고득점을 달성했습니다.',
    icon: '🏆',
    requirementText: '짝맞추기 3,000점 이상',
  },
  {
    id: 'fever_king',
    name: '피버의 제왕',
    description: '단일 게임에서 8연속 콤보 이상을 달성했습니다.',
    icon: '💥',
    requirementText: '한 판에서 8콤보 달성',
  },
];

interface BadgeContext {
  completedScenarioCount: number;
  streakDays: number;
  totalXp: number;
  /** 미니게임 정산 시점의 기록 (maxCombo 는 방금 끝난 한 판의 값) */
  miniGame?: { highScore: number; gamesCleared: number; maxCombo: number };
}

const CONDITIONS: Record<string, (c: BadgeContext) => boolean> = {
  first_step: (c) => c.completedScenarioCount >= 1,
  streak_3: (c) => c.streakDays >= 3,
  scenario_master: (c) => c.completedScenarioCount >= 3,
  xp_hunter: (c) => c.totalXp >= 1000,
  blitz_rookie: (c) => (c.miniGame?.gamesCleared ?? 0) >= 1,
  blitz_master: (c) => (c.miniGame?.highScore ?? 0) >= 3000,
  fever_king: (c) => (c.miniGame?.maxCombo ?? 0) >= 8,
};

/** 시나리오 완료 후 새로 해금된 뱃지 목록 (이미 가진 뱃지는 제외) */
export function evaluateNewBadges(ownedBadgeIds: string[], context: BadgeContext, today: string): Badge[] {
  const owned = new Set(ownedBadgeIds);
  return BADGE_CATALOG.filter((b) => !owned.has(b.id) && CONDITIONS[b.id]?.(context)).map((b) => ({
    ...b,
    unlockedAt: today,
  }));
}
