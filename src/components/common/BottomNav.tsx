'use client';

import { usePathname } from 'next/navigation';
import NavItem from '@/components/common/NavItem';
import { isImmersiveRoute, isTabActive, NAV_TABS } from '@/constants/navigation';
import { useDueCount } from '@/hooks/useDueCount';

export default function BottomNav() {
  const pathname = usePathname();
  const due = useDueCount();
  if (isImmersiveRoute(pathname)) return null;

  return (
    <nav
      aria-label="하단 내비게이션"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl border-t border-zinc-200/80 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.03)] backdrop-blur-md md:hidden"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {NAV_TABS.map((tab) => (
          <NavItem
            key={tab.id}
            tab={tab.id === 'review' ? { ...tab, badgeCount: due } : tab}
            isActive={isTabActive(pathname, tab.href)}
          />
        ))}
      </div>
    </nav>
  );
}
