'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

export default function Toast() {
  const message = useToastStore((s) => s.message);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 md:bottom-6 flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-white shadow-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
