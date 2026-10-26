'use client';

import { RotateCcw } from 'lucide-react';
import StrokeRenderer from '@/components/kana/StrokeRenderer';
import { useKanaStroke } from '@/hooks/useKanaStroke';
import type { KanaStrokeItem } from '@/types/kana';

interface Props {
  kana: KanaStrokeItem;
}

/** 획순 번호 순서대로 선이 저절로 그어지는 뷰. 마운트될 때 한 번 재생하고, 버튼으로 다시 재생한다 */
export default function StrokeAnimationView({ kana }: Props) {
  const { animationKey, replay } = useKanaStroke();

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center">
      <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-20">
          <div className="border-b border-r border-dashed border-zinc-600" />
          <div className="border-b border-dashed border-zinc-600" />
          <div className="border-r border-dashed border-zinc-600" />
          <div />
        </div>

        <StrokeRenderer item={kana} animationKey={animationKey} className="pointer-events-none h-full w-full" />
      </div>

      <button
        type="button"
        onClick={replay}
        className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-200 active:scale-[0.98]"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        다시 재생
      </button>
    </div>
  );
}
