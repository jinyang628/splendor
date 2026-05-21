'use client';

import { useRouter } from 'next/navigation';

import { use, useEffect } from 'react';

import { toast } from 'sonner';

import StartGameButton from '@/components/lobby/start-game-button';
import StatusText from '@/components/lobby/status-text';
import GemChip from '@/components/shared/game/gem-chip';
import SplendorHeroShell from '@/components/shared/splendor-hero-shell';

import { CARD_COLORS } from '@/types/cards';

import { supabase } from '@/lib/supabase';

type LobbyPageProps = { params: Promise<{ gameId: string }> };

export default function LobbyPage({ params }: LobbyPageProps) {
  const router = useRouter();
  const { gameId } = use(params);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`room-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          const updatedRoom = payload.new;
          if (updatedRoom.is_ready) {
            setTimeout(() => {
              router.push(`/game/${gameId}`);
            }, 1000);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      toast.success('Room code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy room code');
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-[70vh] w-full flex-1 items-center justify-center px-2 py-4 sm:px-4">
      <SplendorHeroShell wide spacious>
        <div className="relative z-10 flex flex-col items-center gap-8 text-center sm:gap-10">
          <div className="splendor-gem-crown flex items-center justify-center gap-2.5 sm:gap-3">
            {CARD_COLORS.map((color) => (
              <GemChip key={color} color={color} prominent />
            ))}
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
            <p className="splendor-eyebrow">The court convenes</p>
            <button
              type="button"
              className="splendor-room-code break-all"
              title="Copy room code"
              aria-label={`Copy room code ${gameId}`}
              onClick={copyRoomCode}
            >
              {gameId}
            </button>
          </div>

          <div className="splendor-divider splendor-divider--lg" aria-hidden />

          <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
            <StatusText />
            <StartGameButton gameId={gameId} />
          </div>
        </div>
      </SplendorHeroShell>
    </main>
  );
}
