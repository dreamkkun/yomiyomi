'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { formatDate } from '@/components/profile/BadgeGrid';
import type { Badge } from '@/types/progress';

interface Props {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeDetailModal({ badge, onClose }: Props) {
  // 정보성 모달이므로 ESC와 바깥 클릭으로도 닫을 수 있다
  useEffect(() => {
    if (!badge) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [badge, onClose]);

  const unlocked = Boolean(badge?.unlockedAt);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={badge.name}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs rounded-3xl border border-zinc-100 bg-white p-6 text-center shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border text-4xl ${
                unlocked ? 'border-emerald-200 bg-emerald-50 shadow-sm' : 'border-zinc-200 bg-zinc-100 grayscale'
              }`}
            >
              {badge.icon}
            </div>

            <span
              className={`mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {unlocked ? '획득 완료' : '잠금 상태'}
            </span>

            <h3 className="text-base font-bold text-zinc-900">{badge.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">{badge.description}</p>

            <div className="mt-4 border-t border-zinc-100 pt-4 text-left">
              <span className="block text-[10px] font-semibold text-zinc-400">달성 조건</span>
              <span className="mt-0.5 block text-xs font-medium text-zinc-700">{badge.requirementText}</span>
              {badge.unlockedAt && (
                <span className="mt-1 block text-[11px] font-semibold text-emerald-600">
                  획득일: {formatDate(badge.unlockedAt)}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
