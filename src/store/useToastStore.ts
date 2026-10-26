import { create } from 'zustand';

interface ToastState {
  message: string | null;
  show: (message: string, durationMs?: number) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message, durationMs = 3000) => {
    clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: null }), durationMs);
  },
  hide: () => set({ message: null }),
}));
