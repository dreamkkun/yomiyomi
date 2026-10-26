'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { NavTabItem } from '@/types/navigation';

interface Props {
  tab: NavTabItem;
  isActive: boolean;
}

export default function NavItem({ tab, isActive }: Props) {
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      aria-current={isActive ? 'page' : undefined}
      className="group relative flex h-full flex-1 select-none flex-col items-center justify-center py-1"
    >
      <div className="relative flex h-7 w-12 items-center justify-center">
        {isActive && (
          <motion.div
            layoutId="activeTabPill"
            className="absolute inset-0 -z-10 rounded-full bg-emerald-50"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}

        <Icon
          className={`h-5 w-5 transition-transform duration-200 ${
            isActive
              ? 'scale-105 stroke-[2.2] text-emerald-600'
              : 'stroke-[1.8] text-zinc-400 group-hover:text-zinc-600'
          }`}
        />

        {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
          <span className="absolute -right-1 -top-0.5 rounded-full border border-white bg-rose-500 px-1.5 text-[9px] font-bold text-white">
            {tab.badgeCount}
          </span>
        )}
      </div>

      <span
        className={`mt-0.5 text-[10px] tracking-tight transition-colors duration-200 ${
          isActive ? 'font-bold text-emerald-600' : 'font-medium text-zinc-400 group-hover:text-zinc-600'
        }`}
      >
        {tab.label}
      </span>
    </Link>
  );
}
