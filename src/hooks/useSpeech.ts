'use client';

import { useCallback } from 'react';
import { canUseRemoteTts, getVoiceStatus, playJapaneseTTS, playRemoteTTS, refreshVoices } from '@/lib/speech';
import { useToastStore } from '@/store/useToastStore';

const NOTICE_COOLDOWN_MS = 30_000;
let lastNoticeAt = 0; // 게임처럼 소리를 자주 내는 화면에서 같은 안내가 매번 뜨지 않도록 제한한다

export function useSpeech() {
  const showToast = useToastStore((s) => s.show);

  const notify = useCallback(
    (message: string) => {
      const now = Date.now();
      if (now - lastNoticeAt < NOTICE_COOLDOWN_MS) return;
      lastNoticeAt = now;
      showToast(message, 4000);
    },
    [showToast],
  );

  /** 재생을 시작했으면 true, 음성이 없어 재생하지 못했으면 false */
  const speak = useCallback(
    (text: string, onEnd?: () => void): boolean => {
      refreshVoices();
      const status = getVoiceStatus();

      if (status === 'unsupported' || status === 'missing') {
        // 일본어 음성이 없으면 인터넷 음성(서버 프록시)으로 대신 읽는다
        if (canUseRemoteTts(text)) {
          playRemoteTTS(text, onEnd, () => notify('인터넷 음성을 불러오지 못했어요 · 네트워크를 확인해 주세요'));
          return true;
        }
        notify(
          status === 'unsupported'
            ? '이 브라우저는 음성 재생을 지원하지 않아요'
            : '일본어 음성이 설치되어 있지 않아요 · 화면 위 안내를 확인해 주세요',
        );
        return false;
      }
      // 'checking'(음성 목록 로딩 중)이면 일단 재생을 시도한다
      playJapaneseTTS(text, onEnd);
      return true;
    },
    [notify],
  );

  return { speak };
}
