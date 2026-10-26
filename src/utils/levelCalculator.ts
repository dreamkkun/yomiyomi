export const XP_PER_LEVEL = 500;

/** XP 기반 레벨 계산: Level = floor(totalXp / 500) + 1 */
export function calculateLevel(totalXp: number) {
  const xp = Number.isFinite(totalXp) && totalXp > 0 ? Math.floor(totalXp) : 0;
  const currentLevelXp = xp % XP_PER_LEVEL;
  return {
    currentLevel: Math.floor(xp / XP_PER_LEVEL) + 1,
    currentLevelXp,
    nextLevelXp: XP_PER_LEVEL,
    levelProgressPercent: Math.round((currentLevelXp / XP_PER_LEVEL) * 100),
  };
}
