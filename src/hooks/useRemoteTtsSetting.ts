'use client';

import { useSyncExternalStore } from 'react';
import { isRemoteTtsEnabled, setRemoteTtsEnabled, subscribeRemoteTts } from '@/lib/speech';

/** 인터넷 음성(대체 수단) 사용 여부와 변경 함수. 서버 렌더에서는 기본값(꺼짐)으로 본다 */
export function useRemoteTtsSetting() {
  const enabled = useSyncExternalStore(subscribeRemoteTts, isRemoteTtsEnabled, () => false);
  return [enabled, setRemoteTtsEnabled] as const;
}
