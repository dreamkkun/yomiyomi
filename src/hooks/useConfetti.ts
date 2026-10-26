'use client';

import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const triggerRewardConfetti = useCallback(() => {
    // 1차 폭죽: 화면 중앙 확산
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
      disableForReducedMotion: true,
    });

    // 2차 폭죽: 300ms 후 좌우 분사
    timer.current = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10B981', '#FBBF24'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10B981', '#FBBF24'],
        disableForReducedMotion: true,
      });
    }, 300);
  }, []);

  return { triggerRewardConfetti };
};
