'use client';

import { useEffect, useState } from 'react';
import { getVoiceStatus, isSpeechSupported, loadVoices, type VoiceStatus } from '@/lib/speech';

/** 이 브라우저에서 일본어 음성을 쓸 수 있는지 (음성 목록이 비동기로 바뀌는 것도 따라간다) */
export function useJapaneseVoiceStatus(): VoiceStatus {
  const [status, setStatus] = useState<VoiceStatus>('checking');

  useEffect(() => {
    const update = () => setStatus(getVoiceStatus());
    update();

    if (!isSpeechSupported()) return;
    // 목록이 채워질 때까지 기다리고, 이후 음성이 추가/제거되는 경우(voiceschanged)에도 갱신한다
    void loadVoices().then(update);
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);

  return status;
}
