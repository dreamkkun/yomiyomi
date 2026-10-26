import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgressState } from '@/types';
import type { MiniGameId, MiniGameRewardResult, ScenarioReward } from '@/types/progress';
import type { VocabProgressState } from '@/types/vocab';
import { evaluateNewBadges } from '@/utils/badgeEvaluator';
import type { SrsItem, SrsItemInput, SrsRating, SrsSessionResult } from '@/types/srs';
import { addDays, toDateString, todayString } from '@/utils/date';
import { calculateLevel } from '@/utils/levelCalculator';
import { calculateNextSrsState, MIN_EASE } from '@/utils/sm2Algorithm';

interface ProgressStore extends UserProgressState, VocabProgressState {
  toggleChar: (id: string) => void;
  addScore: (points: number) => void;
  /** 미니게임 한 판을 정산한다: XP·최고 기록·플레이 횟수·스트릭·뱃지를 한 번의 set 으로 원자적으로 반영 */
  completeMiniGame: (params: {
    gameId: MiniGameId;
    score: number;
    earnedXp: number;
    maxCombo: number;
    cleared: boolean;
  }) => MiniGameRewardResult;
  completeScenario: (scenarioId: string) => ScenarioReward;
  /** 오답을 SRS 오답 노트에 등록한다: 새 항목이면 신규 삽입, 이미 있으면 난이도를 올리고 오늘 복습 대상으로 되돌린다 */
  recordMistake: (item: SrsItemInput) => void;
  updateSrsReview: (id: string, rating: SrsRating) => void;
  /** 복습 세션 완료 보상(+XP)과 스트릭 반영 */
  completeSrsSession: (params: { totalReviewed: number; graduatedCount: number }) => SrsSessionResult;
  resetProgress: () => void;
}

export const FIRST_COMPLETION_XP = 100;
export const REVIEW_XP = 30;
export const SRS_SESSION_XP = 60;

const initial: UserProgressState = {
  streakDays: 0,
  lastStudyDate: '',
  completedChars: [],
  completedScenarioIds: [],
  memorizedWordIds: [],
  srsItems: {},
  miniGameStats: {
    kanaMatch: { highScore: 0, gamesPlayed: 0, gamesCleared: 0, lastPlayedAt: null },
  },
  badges: [],
  totalScore: 0,
};

/** 오늘 학습했을 때의 스트릭: 같은 날이면 유지, 어제였으면 +1, 그 외(하루 이상 건너뜀)는 1로 초기화 */
function computeStreak(lastStudyDate: string, streakDays: number, now: Date) {
  const today = toDateString(now);
  if (lastStudyDate === today) return { today, streak: streakDays, incremented: false };
  const yesterday = addDays(now, -1);
  return {
    today,
    streak: lastStudyDate === yesterday ? streakDays + 1 : 1,
    incremented: true,
  };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initial,

      // 글자 암기 상태 토글: 외움 표시 +10 XP, 해제 시 -10 XP (반복 토글로 XP를 쌓을 수 없다)
      toggleChar: (id) => {
        const { completedChars, lastStudyDate, streakDays, totalScore } = get();
        if (completedChars.includes(id)) {
          set({
            completedChars: completedChars.filter((c) => c !== id),
            totalScore: Math.max(0, totalScore - 10),
          });
          return;
        }
        const { today, streak } = computeStreak(lastStudyDate, streakDays, new Date());
        set({
          completedChars: [...completedChars, id],
          lastStudyDate: today,
          streakDays: streak,
          totalScore: totalScore + 10,
        });
      },

      addScore: (points) => set({ totalScore: get().totalScore + points }),

      completeMiniGame: ({ gameId, score, earnedXp, maxCombo, cleared }) => {
        const state = get();
        const record = state.miniGameStats[gameId];

        const isNewHighScore = score > record.highScore;
        const highScore = Math.max(record.highScore, score);
        const totalScore = state.totalScore + earnedXp;
        const gamesCleared = record.gamesCleared + (cleared ? 1 : 0);

        const now = new Date();
        const { today, streak, incremented } = computeStreak(state.lastStudyDate, state.streakDays, now);

        const newBadges = evaluateNewBadges(
          state.badges.map((b) => b.id),
          {
            completedScenarioCount: state.completedScenarioIds.length,
            streakDays: streak,
            totalXp: totalScore,
            miniGame: { highScore, gamesCleared, maxCombo },
          },
          today,
        );

        set({
          totalScore,
          streakDays: streak,
          lastStudyDate: today,
          badges: [...state.badges, ...newBadges],
          miniGameStats: {
            ...state.miniGameStats,
            [gameId]: {
              highScore,
              gamesPlayed: record.gamesPlayed + 1,
              gamesCleared,
              lastPlayedAt: now.toISOString(),
            },
          },
        });

        return {
          earnedXp,
          finalScore: score,
          isCleared: cleared,
          isNewHighScore,
          highScore,
          isStreakIncremented: incremented,
          newBadges,
          previousTotalXp: state.totalScore,
          currentTotalXp: totalScore,
          currentLevel: calculateLevel(totalScore).currentLevel,
        };
      },

      toggleMemorize: (wordId) => {
        const { memorizedWordIds } = get();
        set({
          memorizedWordIds: memorizedWordIds.includes(wordId)
            ? memorizedWordIds.filter((id) => id !== wordId)
            : [...memorizedWordIds, wordId],
        });
      },

      isMemorized: (wordId) => get().memorizedWordIds.includes(wordId),

      completeScenario: (scenarioId) => {
        const state = get();
        const isFirstCompletion = !state.completedScenarioIds.includes(scenarioId);
        const earnedXp = isFirstCompletion ? FIRST_COMPLETION_XP : REVIEW_XP;

        const { today, streak, incremented } = computeStreak(state.lastStudyDate, state.streakDays, new Date());

        const completedScenarioIds = isFirstCompletion
          ? [...state.completedScenarioIds, scenarioId]
          : state.completedScenarioIds;

        const totalScore = state.totalScore + earnedXp;
        const newBadges = evaluateNewBadges(
          state.badges.map((b) => b.id),
          { completedScenarioCount: completedScenarioIds.length, streakDays: streak, totalXp: totalScore },
          today,
        );

        set({
          totalScore,
          streakDays: streak,
          lastStudyDate: today,
          completedScenarioIds,
          badges: [...state.badges, ...newBadges],
        });

        return {
          earnedXp,
          newBadge: newBadges[0] ?? null, // 축하 모달에는 첫 번째 신규 뱃지만 노출, 나머지는 프로필에서 확인

          isStreakIncremented: incremented,
          streakDays: streak,
          isReview: !isFirstCompletion,
        };
      },

      recordMistake: (input) => {
        const { srsItems } = get();
        const today = todayString();
        const existing = srsItems[input.id];

        const next: SrsItem = existing
          ? {
              ...existing,
              mistakeCount: existing.mistakeCount + 1,
              repetitions: 0,
              interval: 1,
              easeFactor: Math.max(MIN_EASE, Math.round((existing.easeFactor - 0.2) * 100) / 100),
              nextReviewDate: today,
            }
          : {
              ...input,
              repetitions: 0,
              interval: 1,
              easeFactor: 2.5,
              nextReviewDate: today,
              lastReviewedAt: null,
              mistakeCount: 1,
            };
        set({ srsItems: { ...srsItems, [input.id]: next } });
      },

      updateSrsReview: (id, rating) => {
        const { srsItems } = get();
        const item = srsItems[id];
        if (!item) return;
        const now = new Date();
        set({
          srsItems: {
            ...srsItems,
            [id]: { ...item, ...calculateNextSrsState(item, rating, now), lastReviewedAt: toDateString(now) },
          },
        });
      },

      completeSrsSession: ({ totalReviewed, graduatedCount }) => {
        const state = get();
        const { today, streak } = computeStreak(state.lastStudyDate, state.streakDays, new Date());
        set({ totalScore: state.totalScore + SRS_SESSION_XP, streakDays: streak, lastStudyDate: today });
        return { totalReviewed, graduatedCount, earnedXp: SRS_SESSION_XP };
      },

      resetProgress: () => set({ ...initial }),
    }),
    {
      name: 'yomi-yomi-progress',
      version: 1,
      // v0: 짝맞추기 최고 점수가 matchBestScore 한 칸이었다 -> miniGameStats.kanaMatch.highScore 로 옮긴다
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 1 && typeof state.matchBestScore === 'number') {
          state.miniGameStats = {
            kanaMatch: { ...initial.miniGameStats.kanaMatch, highScore: state.matchBestScore },
          };
          delete state.matchBestScore;
        }
        return state as unknown as ProgressStore;
      },
      // SSR 하이드레이션 불일치 방지: 클라이언트 마운트 후 수동 rehydrate
      skipHydration: true,
    },
  ),
);
