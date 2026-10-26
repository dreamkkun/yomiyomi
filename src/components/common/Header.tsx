'use client';

import Link from 'next/link';
import { Flame, Star } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';

export default function Header({ ready }: { ready: boolean }) {
  const streakDays = useProgressStore((s) => s.streakDays);
  const totalScore = useProgressStore((s) => s.totalScore);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-600">
          Yomi<span className="text-amber-500">-Yomi</span>
        </h1>
        <Link href="/profile" title="내 프로필" className="flex items-center gap-4 text-sm font-extrabold">
          <span className="flex items-center gap-1 text-amber-500" title="연속 학습일">
            <Flame size={20} fill="currentColor" />
            {ready ? streakDays : 0}
          </span>
          <span className="flex items-center gap-1 text-emerald-600" title="총 경험치">
            <Star size={20} fill="currentColor" />
            {ready ? totalScore : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
