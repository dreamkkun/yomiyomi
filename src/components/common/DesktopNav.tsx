'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isImmersiveRoute, isTabActive, NAV_TABS } from '@/constants/navigation';
import { useDueCount } from '@/hooks/useDueCount';

// 하단 바는 모바일 전용(md:hidden)이므로, 데스크톱에서는 상단에 같은 탭을 텍스트 링크로 제공한다
export default function DesktopNav() {
  const pathname = usePathname();
  const due = useDueCount();
  if (isImmersiveRoute(pathname)) return null;

  return (
    <nav aria-label="상단 내비게이션" className="hidden items-center gap-1 border-b border-zinc-200 bg-white px-4 py-2 md:flex">
      {NAV_TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              active ? 'bg-emerald-50 font-bold text-emerald-600' : 'font-medium text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {tab.id === 'review' && due > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{due}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
