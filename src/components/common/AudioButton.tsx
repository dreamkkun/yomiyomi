'use client';

import { Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

export default function AudioButton({ text, label }: { text: string; label?: string }) {
  const { speak } = useSpeech();

  return (
    <button
      type="button"
      aria-label={label ?? `${text} 발음 듣기`}
      onClick={(e) => {
        e.stopPropagation(); // 카드 뒤집힘 방지
        speak(text);
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition hover:bg-sky-200 active:scale-90"
    >
      <Volume2 size={18} />
    </button>
  );
}
