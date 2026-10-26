import { redirect } from 'next/navigation';

// 첫 화면은 문자 학습 탭
export default function HomePage() {
  redirect('/kana');
}
