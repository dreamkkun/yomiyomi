'use client';

import { motion } from 'framer-motion';
import { STROKE_DURATION, strokeDelay } from '@/hooks/useKanaStroke';
import type { KanaStrokeItem } from '@/types/kana';

interface Props {
  item: KanaStrokeItem;
  /** 값이 바뀌면 애니메이션이 처음부터 다시 재생된다 */
  animationKey?: number;
  showGuide?: boolean; // 전체 글자 윤곽(연한 선)
  showNumbers?: boolean; // 획순 번호
  className?: string;
}

// viewBox 0 0 100 100 정규 좌표계. 글자는 10~90 여백 안에 중앙 정렬되어 있다
export default function StrokeRenderer({
  item,
  animationKey = 0,
  showGuide = true,
  showNumbers = true,
  className = '',
}: Props) {
  return (
    <svg
      key={`${item.id}-${animationKey}`}
      viewBox="0 0 100 100"
      className={`aspect-square ${className}`}
      role="img"
      aria-label={`${item.char} 획순`}
    >
      {showGuide &&
        item.strokes.map((s) => (
          <path
            key={`guide-${s.order}`}
            d={s.d}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

      {item.strokes.map((s) => (
        <motion.path
          key={`draw-${s.order}`}
          d={s.d}
          fill="none"
          stroke="#059669"
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: STROKE_DURATION, delay: strokeDelay(s.order), ease: 'easeInOut' }}
        />
      ))}

      {showNumbers &&
        item.strokes.map(
          (s) =>
            s.label && (
              <motion.text
                key={`label-${s.order}`}
                x={s.label.x}
                y={s.label.y}
                fontSize={7}
                fontWeight={700}
                fill="#be123c"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: strokeDelay(s.order), duration: 0.2 }}
              >
                {s.order}
              </motion.text>
            ),
        )}
    </svg>
  );
}

interface GuideProps {
  item: KanaStrokeItem;
  currentIndex: number; // 지금 써야 하는 획 (0부터), item.strokes.length 이면 모두 완료
  className?: string;
}

// 따라 쓰기용 정적 가이드: 지난 획은 진한 녹색, 현재 획은 연한 에메랄드, 남은 획은 옅은 회색 점선
export function StrokeGuide({ item, currentIndex, className = '' }: GuideProps) {
  return (
    <svg viewBox="0 0 100 100" className={`aspect-square ${className}`} aria-hidden>
      {item.strokes.map((s, idx) => {
        const past = idx < currentIndex;
        const current = idx === currentIndex;
        return (
          <path
            key={s.order}
            d={s.d}
            fill="none"
            stroke={past ? '#059669' : current ? '#A7F3D0' : '#E4E4E7'}
            strokeWidth={past || current ? 7 : 5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={!past && !current ? '1.5 5' : undefined}
            className="transition-colors duration-300"
          />
        );
      })}
    </svg>
  );
}
