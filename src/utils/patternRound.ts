import type { PatternBlock, PatternExercise, PatternRound, PatternStep, WordChunk } from '@/types/pattern';

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const nounBlock = (c: WordChunk): PatternBlock => ({
  id: c.id,
  japanese: c.japanese,
  furigana: c.furigana,
  kind: 'noun',
  korean: c.korean,
  romaji: c.romaji,
});

/** 한 문형의 한 단계 문제를 만든다 */
export function buildRound(pattern: PatternExercise, step: PatternStep): PatternRound {
  const allChunks = [...pattern.correctChunks, ...pattern.distractorChunks];
  const target = shuffle(pattern.correctChunks)[0];
  const [particle, predicate] = pattern.suffixParts;

  // 1단계: 슬롯 단어 갈아끼우기 (접미사는 고정)
  if (step === 1) {
    return {
      step,
      slotCount: 1,
      pool: shuffle(allChunks.map(nounBlock)),
      validIds: pattern.correctChunks.map((c) => c.id),
      targetNoun: target,
      staticSuffix: true,
    };
  }

  const particleBlock: PatternBlock = { id: `${pattern.id}_particle`, kind: 'particle', ...particle };
  const predicateBlock: PatternBlock = { id: `${pattern.id}_predicate`, kind: 'predicate', ...predicate };

  // 2단계: 어순 배열 퀴즈 (단어 + 조사 + 서술어를 올바른 순서로)
  if (step === 2) {
    return {
      step,
      slotCount: 3,
      pool: shuffle([nounBlock(target), particleBlock, predicateBlock]),
      solution: [target.id, particleBlock.id, predicateBlock.id],
      targetNoun: target,
      staticSuffix: false,
    };
  }

  // 3단계: 한국어를 보고 직접 문장 완성 (방해 단어와 틀린 조사가 섞인다)
  const otherNouns = shuffle(allChunks.filter((c) => c.id !== target.id));
  const distractorNoun = pattern.distractorChunks[0];
  const nouns = [target, ...(distractorNoun ? [distractorNoun] : []), ...otherNouns.filter((c) => c.id !== distractorNoun?.id)].slice(0, 3);
  const wrongParticle: PatternBlock = {
    id: `${pattern.id}_wrong_particle`,
    kind: 'particle',
    japanese: pattern.wrongParticles[0],
    furigana: pattern.wrongParticles[0],
  };
  return {
    step,
    slotCount: 3,
    pool: shuffle([...nouns.map(nounBlock), particleBlock, wrongParticle, predicateBlock]),
    solution: [target.id, particleBlock.id, predicateBlock.id],
    targetNoun: target,
    staticSuffix: false,
  };
}

/** 슬롯에 놓인 블록들이 정답인지 */
export function isRoundCorrect(round: PatternRound, placed: (PatternBlock | null)[]): boolean {
  if (placed.some((b) => b === null)) return false;
  if (round.step === 1) return round.validIds?.includes(placed[0]!.id) ?? false;
  return placed.every((b, i) => b!.id === round.solution?.[i]);
}
