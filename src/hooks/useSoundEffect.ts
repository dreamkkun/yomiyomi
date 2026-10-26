'use client';

import { useCallback, useRef } from 'react';

type Note = { freq: number; at: number; dur: number };

// Web Audio API 합성 효과음 (오디오 파일 불필요)
export function useSoundEffect() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((notes: Note[], type: OscillatorType) => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = (ctxRef.current ??= new Ctx());
      if (ctx.state === 'suspended') void ctx.resume();
      const now = ctx.currentTime;
      for (const n of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = n.freq;
        gain.gain.setValueAtTime(0.15, now + n.at);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.at + n.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + n.at);
        osc.stop(now + n.at + n.dur);
      }
    } catch {
      // 오디오를 쓸 수 없는 환경에서는 조용히 무시
    }
  }, []);

  const playCorrect = useCallback(
    () => play([{ freq: 660, at: 0, dur: 0.12 }, { freq: 880, at: 0.1, dur: 0.18 }], 'sine'),
    [play],
  );
  const playWrong = useCallback(
    () => play([{ freq: 200, at: 0, dur: 0.2 }], 'square'),
    [play],
  );

  return { playCorrect, playWrong };
}
