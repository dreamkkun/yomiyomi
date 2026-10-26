'use client';

import { motion } from 'framer-motion';
import { Flame, RotateCcw, Timer, Volume2, VolumeX, Zap } from 'lucide-react';
import { TOTAL_GAME_TIME } from '@/hooks/useKanaMatchEngine';
import type { GameStats } from '@/types/matchGame';

interface Props {
  stats: GameStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
}

export default function GameHeader({ stats, soundEnabled, onToggleSound, onRestart }: Props) {
  const { timeLeft, combo, isFever, score } = stats;
  const urgent = timeLeft <= 5;
  const warn = timeLeft <= 10;

  return (
    <header className="border-b border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
            <Zap className="h-4 w-4 fill-emerald-500" />
          </span>
          <h1 className="text-base font-black text-zinc-900">Kana Match Blitz</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            title="소리 켜기/끄기"
            aria-label="소리 켜기/끄기"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onRestart}
            title="다시 시작"
            aria-label="다시 시작"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="남은 시간"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={TOTAL_GAME_TIME}
        className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100"
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            urgent ? 'animate-pulse bg-rose-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${(timeLeft / TOTAL_GAME_TIME) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-bold">
        <div className={`flex items-center gap-1.5 ${urgent ? 'text-rose-600' : 'text-zinc-600'}`}>
          <Timer className="h-4 w-4" />
          <span>{timeLeft}s</span>
        </div>

        <div className="flex items-center gap-2">
          {combo > 0 && (
            <motion.div
              key={combo}
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.15, 1] }}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                isFever ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <Flame className="h-3 w-3 fill-current" />
              <span>{combo} COMBO</span>
              {isFever && <span className="text-[9px] font-black">x2.0</span>}
            </motion.div>
          )}
          <div className="text-sm font-black text-zinc-900">{score.toLocaleString()} P</div>
        </div>
      </div>
    </header>
  );
}
