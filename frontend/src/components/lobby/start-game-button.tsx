'use client';

import { useState } from 'react';

import { initialize } from '@/actions/games/initialize';
import { hostByGameIdAtom, isHostForGame } from '@/state/game';
import { useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

type StartGameButtonProps = {
  gameId: string;
};

export default function StartGameButton({ gameId }: StartGameButtonProps) {
  const hostByGameId = useAtomValue(hostByGameIdAtom);
  const isHost = isHostForGame(hostByGameId, gameId);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      await initialize(gameId);
      toast.success('Game started');
    } catch (error) {
      toast.error('Failed to start game. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHost) return null;

  return (
    <Button
      type="button"
      size="lg"
      disabled={isLoading}
      className="splendor-cta border-splendor-gold/40 from-splendor-gold to-splendor-gold h-12 w-full max-w-xs cursor-pointer rounded-xl border bg-gradient-to-r via-amber-400 text-base font-semibold tracking-wide text-amber-950 shadow-[0_4px_24px_-4px_color-mix(in_oklch,var(--splendor-gold)_55%,transparent),inset_0_1px_0_color-mix(in_oklch,white_40%,transparent)] transition hover:shadow-[0_6px_28px_-4px_color-mix(in_oklch,var(--splendor-gold)_65%,transparent)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 dark:via-amber-300"
      onClick={handleStartGame}
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Start Game'}
    </Button>
  );
}
