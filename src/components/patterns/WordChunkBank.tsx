'use client';

import { motion } from 'framer-motion';
import RubyText from '@/components/common/RubyText';
import type { PatternBlock } from '@/types/pattern';

interface Props {
  blocks: PatternBlock[];
  disabled?: boolean;
  onTap: (block: PatternBlock) => void;
}

export default function WordChunkBank({ blocks, disabled, onTap }: Props) {
  return (
    <div>
      <span className="mb-2 block px-1 text-xs font-bold text-zinc-500">아래 블록을 탭해서 슬롯에 끼워 보세요</span>
      <div className="flex min-h-14 flex-wrap gap-2.5">
        {blocks.map((block) => (
          <motion.button
            key={block.id}
            layoutId={`block-${block.id}`}
            type="button"
            disabled={disabled}
            onClick={() => onTap(block)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="min-h-12 rounded-2xl bg-zinc-100 px-4 py-2.5 text-left transition-colors hover:bg-emerald-50 disabled:opacity-50"
          >
            <span className="block text-base font-extrabold leading-normal text-zinc-900">
              <RubyText htmlContent={block.furigana} />
            </span>
            {block.korean && (
              <span className="block text-[11px] font-medium text-zinc-500">
                {block.korean} ({block.romaji})
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
