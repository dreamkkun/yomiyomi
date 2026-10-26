'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

const SILENT = 0.0001;

/** 짝맞추기 게임용 합성 효과음 (외부 오디오 파일 없음). AudioContext 는 첫 사용자 제스처에서 만든다 */
export function useGameSound(enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  useEffect(
    () => () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx && ctx.state !== 'closed') void ctx.close();
    },
    [],
  );

  const tone = useCallback(
    (
      ctx: AudioContext,
      { freq, endFreq, start = 0, duration, type = 'sine', peak = 0.15, lowpass }: {
        freq: number; endFreq?: number; start?: number; duration: number;
        type?: OscillatorType; peak?: number; lowpass?: number;
      },
    ) => {
      const t = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

      // 클릭 노이즈 방지: 짧은 어택 후 지수 감쇠
      gain.gain.setValueAtTime(SILENT, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(SILENT, t + duration);

      let node: AudioNode = osc;
      if (lowpass) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = lowpass;
        osc.connect(filter);
        node = filter;
      }
      node.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    },
    [],
  );

  return useMemo(() => {
    const run = (fn: (ctx: AudioContext) => void) => () => {
      if (!enabledRef.current) return;
      const ctx = getContext();
      if (ctx) fn(ctx);
    };

    return {
      /** 첫 터치에서 호출해 컨텍스트를 만들고 resume */
      unlock: () => void getContext(),
      /** 카드 터치 팝 */
      playFlip: run((ctx) => tone(ctx, { freq: 440, endFreq: 880, duration: 0.06, peak: 0.12 })),
      /** 정답: 실로폰 느낌의 상행 아르페지오 (C5 E5 G5 C6) */
      playMatch: run((ctx) =>
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
          tone(ctx, { freq, start: i * 0.05, duration: 0.25, type: 'triangle', peak: 0.15 }),
        ),
      ),
      /** 오답: 둔탁하고 짧은 하강음 */
      playMismatch: run((ctx) =>
        tone(ctx, { freq: 150, endFreq: 80, duration: 0.16, type: 'triangle', peak: 0.25, lowpass: 400 }),
      ),
      /** 클리어 팡파레 */
      playVictory: run((ctx) => {
        let start = 0;
        for (const [freq, d] of [[523.25, 0.1], [659.25, 0.1], [783.99, 0.1], [1046.5, 0.35]] as const) {
          tone(ctx, { freq, start, duration: d + 0.1, peak: 0.22 });
          start += d * 0.9;
        }
      }),
    };
  }, [getContext, tone]);
}
