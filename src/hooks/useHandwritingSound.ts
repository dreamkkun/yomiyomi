'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { HandwritingSoundController, SoundOptions } from '@/types/audio';

const BRUSH_LEVEL = 0.12; // 붓 마찰음 음량 (과하게 크지 않게 0.08~0.15)
const BRUSH_THROTTLE_MS = 40;
const BRUSH_IDLE_MS = 120; // 이 시간 동안 움직임이 없으면 마찰음을 페이드아웃
const BRUSH_FADE_IN_TC = 0.012; // setTargetAtTime 시정수(초): 약 40ms 안에 목표 음량에 도달
const BRUSH_FADE_OUT_TC = 0.015; // 시정수(초): 약 60ms 안에 무음에 가까워진다
const BRUSH_STOP_AFTER_S = 0.12; // 페이드아웃이 끝난 뒤 소스를 멈추는 시점
const SILENT = 0.0001; // exponentialRamp 는 0 을 쓸 수 없다

/** 1초 분량의 핑크 노이즈 (Paul Kellet 필터). 컨텍스트 생성 시 한 번만 만들어 재사용한다 */
function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const size = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < size; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

interface BrushVoice {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

/**
 * 외부 오디오 파일 없이 Web Audio API 만으로 필기 효과음을 합성한다.
 * AudioContext 는 첫 사용자 제스처에서 만든다 (브라우저 자동 재생 정책 대응).
 */
export function useHandwritingSound(options: SoundOptions = {}): HandwritingSoundController {
  const { masterVolume = 0.8, enabled = true } = options;

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const brushRef = useRef<BrushVoice | null>(null);
  const lastBrushRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // 콜백 정체성을 유지하면서 최신 옵션을 읽기 위한 ref
  const enabledRef = useRef(enabled);
  const volumeRef = useRef(masterVolume);
  enabledRef.current = enabled;
  volumeRef.current = masterVolume;

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (ctxRef.current && ctxRef.current.state !== 'closed') return ctxRef.current;

    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = volumeRef.current;
    master.connect(ctx.destination);

    ctxRef.current = ctx;
    masterRef.current = master;
    noiseRef.current = createPinkNoiseBuffer(ctx);
    return ctx;
  }, []);

  const unlockAudioContext = useCallback(async () => {
    const ctx = ensureContext();
    if (ctx && ctx.state === 'suspended') await ctx.resume();
  }, [ensureContext]);

  // 마스터 볼륨 변경은 컨텍스트를 새로 만들지 않고 게인만 갱신한다
  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx && masterRef.current) masterRef.current.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.01);
  }, [masterVolume]);

  /** 현재 마찰음 보이스를 즉시 분리해 페이드아웃하고 정리한다 (다음 획이 바로 시작돼도 서로 간섭하지 않는다) */
  const fadeOutBrush = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    const ctx = ctxRef.current;
    const voice = brushRef.current;
    if (!ctx || !voice) return;
    brushRef.current = null;

    // 현재 값에서 지수적으로 감쇠시킨다 (.value 를 읽지 않으므로 갓 만든 노드에서도 안전하고, 팝 노이즈가 없다)
    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(SILENT, now, BRUSH_FADE_OUT_TC);
    try {
      voice.source.stop(now + BRUSH_STOP_AFTER_S);
    } catch {
      // 이미 정지됨
    }
    voice.source.onended = () => {
      voice.source.disconnect();
      voice.filter.disconnect();
      voice.gain.disconnect();
    };
  }, []);

  const playBrushStroke = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = ensureContext();
    const noise = noiseRef.current;
    const master = masterRef.current;
    if (!ctx || !noise || !master) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const nowMs = performance.now();
    if (brushRef.current && nowMs - lastBrushRef.current < BRUSH_THROTTLE_MS) return;
    lastBrushRef.current = nowMs;

    let voice = brushRef.current;
    if (!voice) {
      // 획마다 노드 한 세트만 만들고, 움직이는 동안은 같은 루프 소스를 계속 쓴다
      const source = ctx.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = noise.duration;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.8;

      // 생성 직후의 .value 는 오디오 스레드가 처리하기 전까지 기본값(1.0)이므로 반드시 직접 무음으로 시작한다
      const gain = ctx.createGain();
      gain.gain.value = SILENT;

      source.connect(filter).connect(gain).connect(master);
      source.start();
      voice = { source, filter, gain };
      brushRef.current = voice;
    }

    // 움직이는 동안 음량 유지 (팝 노이즈가 없도록 부드럽게 접근)
    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(BRUSH_LEVEL, now, BRUSH_FADE_IN_TC);

    // 포인터가 멈추면(이벤트가 더 오지 않으면) 스스로 페이드아웃
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(fadeOutBrush, BRUSH_IDLE_MS);
  }, [ensureContext, fadeOutBrush]);

  const playSuccess = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = ensureContext();
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const tone = (freq: number, start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      // Attack 10ms -> Decay 350ms (지수 감쇠)
      gain.gain.setValueAtTime(SILENT, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(SILENT, start + 0.01 + 0.35);
      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + 0.4);
    };

    const t = ctx.currentTime;
    tone(1318.51, t); // E6
    tone(1975.53, t + 0.08); // B6, 80ms 뒤 상행
  }, [ensureContext]);

  const playFailure = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = ensureContext();
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.2); // 피치 하강

    filter.type = 'lowpass';
    filter.frequency.value = 350;

    // Attack 5ms -> Decay 200ms 후 즉시 뮤트
    gain.gain.setValueAtTime(SILENT, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(SILENT, t + 0.205);
    gain.gain.setValueAtTime(0, t + 0.21);

    osc.connect(filter).connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.22);
  }, [ensureContext]);

  const stopBrushStroke = useCallback(() => fadeOutBrush(), [fadeOutBrush]);

  // 언마운트 시 타이머와 AudioContext 정리
  useEffect(
    () => () => {
      clearTimeout(idleTimerRef.current);
      brushRef.current = null;
      const ctx = ctxRef.current;
      ctxRef.current = null;
      masterRef.current = null;
      noiseRef.current = null;
      if (ctx && ctx.state !== 'closed') void ctx.close();
    },
    [],
  );

  return useMemo(
    () => ({ playBrushStroke, stopBrushStroke, playSuccess, playFailure, unlockAudioContext }),
    [playBrushStroke, stopBrushStroke, playSuccess, playFailure, unlockAudioContext],
  );
}
