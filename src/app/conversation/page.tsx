import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import dialogues from '@/data/dialogues.json';
import type { DialogueScenario } from '@/types';

const scenarios = dialogues as DialogueScenario[];

export default function ConversationListPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/kana" className="mb-4 flex items-center gap-1 text-sm font-bold text-emerald-600">
        <ArrowLeft size={16} /> 문자 학습으로
      </Link>
      <h1 className="mb-1 text-2xl font-extrabold">여행 회화 롤플레잉</h1>
      <p className="mb-6 text-sm text-slate-500">
        상대방의 말을 듣고, 내 차례의 빈칸을 맞혀야 다음 대화로 넘어가요.
      </p>

      <ul className="space-y-3">
        {scenarios.map((s) => (
          <li key={s.id}>
            <Link
              href={`/conversation/${s.id}`}
              className="flex items-center gap-4 rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-4 transition hover:bg-emerald-50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <MessageCircle size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold">{s.title}</span>
                <span className="block truncate text-sm text-slate-500">{s.situation}</span>
              </span>
              <ArrowRight size={20} className="text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
