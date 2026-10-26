import type { LucideIcon } from 'lucide-react';

export interface NavTabItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badgeCount?: number;
}
