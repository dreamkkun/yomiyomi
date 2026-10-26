import ProgressBar from '@/components/common/ProgressBar';
import { categoryLabel } from '@/constants/vocab';
import type { VocabCategory } from '@/types/vocab';

interface Props {
  category: VocabCategory;
  memorized: number;
  total: number;
}

export default function VocabProgressBar({ category, memorized, total }: Props) {
  return <ProgressBar value={memorized} max={total} label={`${categoryLabel(category)} 암기 진척도`} />;
}
