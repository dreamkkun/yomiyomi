'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, RotateCcw } from 'lucide-react';
import type { DialogueScenario } from '@/types';

interface Toggles {
  showFurigana: boolean;
  showTranslation: boolean;
  autoSpeak: boolean;
  autoAdvance: boolean;
}

interface Props extends Toggles {
  scenario: DialogueScenario;
  progress: number;
  onChange: (patch: Partial<Toggles>) => void;
  onReset: () => void;
}

function Pill({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 transition-colors ${
        on ? 'border-zinc-800 bg-zinc-800 text-white' : 'border-zinc-300 bg-white text-zinc-500'
      }`}
    >
      {on ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export default function RoleplayHeader({
  scenario,
  progress,
  showFurigana,
  showTranslation,
  autoSpeak,
  autoAdvance,
  onChange,
  onReset,
}: Props) {
  return (
    <header className="z-10 border-b border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <Link href="/conversation" className="mb-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <ArrowLeft className="h-3.5 w-3.5" /> 시나리오 목록
          </Link>
          <span className="block truncate text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {scenario.situation}
          </span>
          <h1 className="text-lg font-bold text-zinc-900">{scenario.title}</h1>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="p-2 text-zinc-400 transition-colors hover:text-zinc-600"
          title="처음부터 다시하기"
          aria-label="처음부터 다시하기"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200"
      >
        <div
          className="h-2 bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
        <Pill on={showFurigana} label="후리가나" onClick={() => onChange({ showFurigana: !showFurigana })} />
        <Pill on={showTranslation} label="해석" onClick={() => onChange({ showTranslation: !showTranslation })} />
        <Pill on={autoSpeak} label="자동 재생" onClick={() => onChange({ autoSpeak: !autoSpeak })} />
        <Pill on={autoAdvance} label="자동 진행" onClick={() => onChange({ autoAdvance: !autoAdvance })} />
      </div>
    </header>
  );
}
