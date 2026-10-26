'use client';

import { motion } from 'framer-motion';
import AudioButton from '@/components/common/AudioButton';
import RubyText from '@/components/common/RubyText';
import type { DialogueLine } from '@/types';

interface Props {
  line: DialogueLine;
  showTranslation: boolean;
  /** 빈칸 퀴즈가 아직 풀리지 않았으면 true: 본문의 정답 단어를 [ ? ]로 가린다 */
  masked?: boolean;
}

// 후리가나 ON/OFF는 부모 컨테이너의 .hide-furigana 클래스가 CSS로 처리한다
export default function DialogueBubble({ line, showTranslation, masked }: Props) {
  const isNpc = line.speaker === 'npc';
  const blank = masked ? line.quizOption?.blankWord : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col ${isNpc ? 'items-start' : 'items-end'}`}
    >
      <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-zinc-500">
        <span>{isNpc ? '점원/상대방' : '나'}</span>
        {!masked && <AudioButton text={line.audioPrompt || line.japanese} />}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isNpc
            ? 'rounded-bl-none border border-zinc-200 bg-white text-zinc-900'
            : 'rounded-br-none bg-emerald-600 text-white'
        }`}
      >
        <div className="text-base font-medium leading-[1.85] tracking-wide">
          <RubyText htmlContent={line.furigana} blank={blank} />
        </div>

        {showTranslation && (
          <p
            className={`mt-1.5 border-t pt-1.5 text-xs ${
              isNpc ? 'border-zinc-100 text-zinc-500' : 'border-emerald-500/60 text-emerald-100'
            }`}
          >
            {line.korean}
          </p>
        )}
      </div>
    </motion.div>
  );
}
