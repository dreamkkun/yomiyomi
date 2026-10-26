import type { Badge } from '@/types/progress';

interface Props {
  badge: Badge;
  highlight?: boolean; // 신규 획득: 황금빛 테두리 펄스
}

export default function BadgeIcon({ badge, highlight }: Props) {
  return (
    <span
      role="img"
      aria-label={badge.name}
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-white text-3xl shadow-sm ${
        highlight ? 'animate-pulse border-2 border-amber-400' : 'border-emerald-100'
      }`}
    >
      {badge.icon}
    </span>
  );
}
