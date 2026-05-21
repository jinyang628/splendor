'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { createRoom } from '@/actions/room/create';
import { gameIdAtom, hostByGameIdAtom } from '@/state/game';
import { useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { getCurrentUserId } from '@/lib/supabase';
import { getRandomGameId } from '@/lib/utils';

export default function CreateRoomButton() {
  const router = useRouter();
  const setGameId = useSetAtom(gameIdAtom);
  const setHostByGameId = useSetAtom(hostByGameIdAtom);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const gameId: string = getRandomGameId();
      setGameId(gameId);
      setHostByGameId((prev) => ({ ...prev, [gameId]: true }));
      await createRoom(gameId, await getCurrentUserId());
      router.push(`/lobby/${gameId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      disabled={isLoading}
      className="splendor-cta border-splendor-gold/40 from-splendor-gold to-splendor-gold h-12 w-full cursor-pointer rounded-xl border bg-gradient-to-r via-amber-400 text-base font-semibold tracking-wide text-amber-950 shadow-[0_4px_24px_-4px_color-mix(in_oklch,var(--splendor-gold)_55%,transparent),inset_0_1px_0_color-mix(in_oklch,white_40%,transparent)] transition hover:shadow-[0_6px_28px_-4px_color-mix(in_oklch,var(--splendor-gold)_65%,transparent)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 dark:via-amber-300"
      onClick={handleCreateRoom}
    >
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Room'}
    </Button>
  );
}
