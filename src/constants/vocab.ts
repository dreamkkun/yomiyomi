import type { VocabCategory } from '@/types/vocab';

export const VOCAB_CATEGORIES: { id: VocabCategory; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'restaurant', label: '식당' },
  { id: 'hotel', label: '호텔' },
  { id: 'directions', label: '길찾기' },
  { id: 'basic', label: '기초' },
];

export const categoryLabel = (id: VocabCategory) =>
  VOCAB_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const QUIZ_LENGTH = 5;
export const QUIZ_REWARD_XP = 50;
