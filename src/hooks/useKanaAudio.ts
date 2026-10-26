'use client';

import { useCallback } from 'react';
import { useSpeech } from '@/hooks/useSpeech';

/** 문자 단음 발화: 일본어 음성이 없으면 useSpeech가 안내 토스트를 띄운다 */
export function useKanaAudio() {
  const { speak } = useSpeech();
  const speakKana = useCallback((char: string) => speak(char), [speak]);
  return { speakKana };
}
