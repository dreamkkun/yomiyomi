import { BookOpen } from 'lucide-react';
import type { PatternExercise } from '@/types/pattern';

export default function PatternExplainCard({ pattern }: { pattern: PatternExercise }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <div>
        <h3 className="text-xs font-bold text-emerald-950">
          공식: {pattern.patternFormula} <span className="font-medium text-emerald-800/70">({pattern.patternMeaning})</span>
        </h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800/80">{pattern.grammarTip}</p>
      </div>
    </div>
  );
}
