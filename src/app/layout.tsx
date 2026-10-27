import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/common/AppShell';

// 링크 미리보기의 이미지·주소가 절대 경로가 되도록 기준 주소를 지정한다 (Vercel 배포에서는 프로덕션 도메인을 자동으로 사용)
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

const title = 'Yomi-Yomi - 게임처럼 배우는 일본어';
const description = '히라가나·가타카나 획순 따라 쓰기부터 단어, 여행 회화, 짝맞추기 게임, 망각곡선 복습까지 한 곳에서.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'Yomi-Yomi',
  openGraph: {
    type: 'website',
    siteName: 'Yomi-Yomi',
    locale: 'ko_KR',
    title,
    description,
    url: '/',
  },
  // 대표 이미지는 app/opengraph-image.tsx 가 자동으로 og:image 로 연결된다
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
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
