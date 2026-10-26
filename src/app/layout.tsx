import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/common/AppShell';

export const metadata: Metadata = {
  title: 'Yomi-Yomi',
  description: '히라가나·가타카나부터 기초 회화까지, 게임처럼 배우는 일본어 웹앱',
};

// iOS에서 env(safe-area-inset-bottom)이 동작하려면 viewport-fit=cover가 필요하다
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
