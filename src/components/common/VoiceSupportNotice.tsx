'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { VolumeX, X } from 'lucide-react';
import { useJapaneseVoiceStatus } from '@/hooks/useJapaneseVoiceStatus';
import { useRemoteTtsSetting } from '@/hooks/useRemoteTtsSetting';

const DISMISS_KEY = 'yomi-voice-notice-dismissed';

const GUIDES = [
  {
    os: 'Windows 10/11',
    steps:
      '설정 → 시간 및 언어 → 음성 → "음성 추가"에서 일본어(Haruka, Ayumi 등)를 설치하세요. 설치 후 브라우저를 완전히 다시 시작합니다. Edge를 쓰면 온라인 일본어 음성(Nanami)이 기본 제공되는 경우가 많아요.',
  },
  {
    os: 'macOS',
    steps: '시스템 설정 → 손쉬운 사용 → 말하기 콘텐츠 → 시스템 음성 → 음성 관리에서 일본어(Kyoko 등)를 내려받으세요.',
  },
  {
    os: 'Android',
    steps: '설정 → 일반(또는 접근성) → 텍스트 음성 변환(TTS) → Google 음성 서비스 → 일본어 음성 데이터를 설치하세요.',
  },
  {
    os: 'iPhone / iPad',
    steps: '설정 → 손쉬운 사용 → 말하기 콘텐츠 → 음성 → 일본어에서 음성을 내려받으세요.',
  },
];

/**
 * 일본어 음성이 없는 브라우저에서 "왜 소리가 안 나는지"와 해결 방법을 알려 주는 안내.
 * 앱이 음성을 새로 만들어 줄 수는 없으므로(브라우저/OS가 제공), 설치 방법을 안내하고 한 번 닫으면 다시 띄우지 않는다.
 */
export default function VoiceSupportNotice() {
  const status = useJapaneseVoiceStatus();
  const [remoteOn, setRemoteOn] = useRemoteTtsSetting();
  const [dismissed, setDismissed] = useState(true); // 저장값을 읽기 전에는 숨겨 깜빡임을 막는다
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 저장할 수 없는 환경이면 이번 방문에서만 숨긴다
    }
  };

  const visible = (status === 'missing' || status === 'unsupported') && !dismissed;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
          role="status"
        >
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900">
            <div className="flex items-start gap-2">
              <VolumeX className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1 text-xs leading-relaxed">
                <p className="font-bold">
                  {remoteOn
                    ? '일본어 음성이 없어 인터넷 음성(Google 번역 TTS)으로 대신 읽어 줘요.'
                    : status === 'unsupported'
                      ? '이 브라우저는 음성 재생을 지원하지 않아 발음이 나오지 않아요.'
                      : '이 기기에는 일본어 음성이 설치되어 있지 않아 발음이 나오지 않아요.'}
                </p>
                <p className="text-amber-800/80">
                  {remoteOn
                    ? '읽을 문장이 구글 서버로 전송되고 인터넷 연결이 필요해요. 기기에 일본어 음성을 설치하면 오프라인에서도 자연스럽게 들려요.'
                    : '학습은 그대로 할 수 있어요. 아래 스위치를 켜면 인터넷 음성(Google 번역 TTS)으로 읽어 주지만, 읽을 문장이 구글로 전송돼요. 일본어 음성을 설치하면 오프라인에서도 들려요.'}
                </p>
                <label className="mt-1.5 flex min-h-8 cursor-pointer items-center gap-2 font-bold">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={remoteOn}
                    onChange={(e) => setRemoteOn(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  인터넷 음성 사용
                </label>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  className="mt-1 font-bold underline underline-offset-2"
                >
                  {open ? '설치 방법 접기' : '설치 방법 보기'}
                </button>

                {open && (
                  <ul className="mt-2 space-y-1.5 rounded-xl bg-white/70 p-2.5">
                    {GUIDES.map((g) => (
                      <li key={g.os}>
                        <span className="font-bold">{g.os}</span> — {g.steps}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="안내 닫기 (다시 보지 않기)"
                title="다시 보지 않기"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
