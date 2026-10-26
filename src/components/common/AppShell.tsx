'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import BottomNav from '@/components/common/BottomNav';
import DesktopNav from '@/components/common/DesktopNav';
import VoiceSupportNotice from '@/components/common/VoiceSupportNotice';
import { isImmersiveRoute } from '@/constants/navigation';
import { useProgressStore } from '@/store/useProgressStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 저장된 진행도를 앱 전체에서 한 번 불러온다 (하단 탭의 복습 배지 등이 어느 화면에서든 정확하도록)
  useEffect(() => {
    void useProgressStore.persist.rehydrate();
  }, []);

  // 하단 바가 보이는 화면에서만 바 높이만큼 여백을 확보한다
  const navPadding = isImmersiveRoute(pathname) ? '' : 'pb-20 md:pb-0';

  return (
    <div className={`relative mx-auto min-h-screen max-w-2xl bg-slate-50 shadow-sm ${navPadding}`}>
      <DesktopNav />
      {!isImmersiveRoute(pathname) && <VoiceSupportNotice />}
      {children}
      <BottomNav />
    </div>
  );
}
