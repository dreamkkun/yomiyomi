import { BookA, BrainCircuit, Languages, MessageSquareQuote, User } from 'lucide-react';
import type { NavTabItem } from '@/types/navigation';

export const NAV_TABS: NavTabItem[] = [
  { id: 'kana', label: '문자', href: '/kana', icon: Languages },
  { id: 'vocab', label: '단어장', href: '/vocab', icon: BookA },
  { id: 'conversation', label: '롤플레잉', href: '/conversation', icon: MessageSquareQuote },
  { id: 'review', label: '복습', href: '/review', icon: BrainCircuit },
  { id: 'profile', label: '대시보드', href: '/profile', icon: User },
];

/** 하위 경로(/conversation/xxx)에서도 해당 탭을 활성 상태로 판정 */
export const isTabActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** 롤플레잉 세션(/conversation/[id])은 전체 화면 몰입형이라 하단 내비게이션을 숨긴다 */
export const isImmersiveRoute = (pathname: string) => pathname.startsWith('/conversation/');
