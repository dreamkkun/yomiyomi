import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  iconClassName: string; // 아이콘 배경/색상
  label: string;
  value: string;
}

export default function StatSummaryCard({ icon, iconClassName, label, value }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
      <div className={`mb-2 rounded-xl p-2 ${iconClassName}`}>{icon}</div>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="mt-0.5 text-lg font-black text-zinc-900">{value}</span>
    </div>
  );
}
