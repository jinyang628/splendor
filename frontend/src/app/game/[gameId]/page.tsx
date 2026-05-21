'use client';

import { use, useEffect, useState } from 'react';

import { fetchGameData } from '@/actions/games/fetchGameData';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import GameBoard from '@/components/game/game-board';

import type { FetchGameDataResponse } from '@/types/games';

import { getCurrentUserId } from '@/lib/supabase';

type GamePageProps = { params: Promise<{ gameId: string }> };

export default function GamePage({ params }: GamePageProps) {
  const { gameId } = use(params);
  const [gameData, setGameData] = useState<FetchGameDataResponse | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    (async () => {
      try {
        const [data, playerId] = await Promise.all([fetchGameData(gameId), getCurrentUserId()]);
        if (!cancelled) {
          setGameData(data);
          setCurrentPlayerId(playerId);
        }
      } catch (error) {
        if (!cancelled) toast.error('Failed to load game');
        console.error(error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!gameData) {
    return <p className="text-muted-foreground text-center text-sm">Could not load this game.</p>;
  }

  return (
    <main className="flex w-full flex-1 items-start justify-center px-2 py-2 sm:px-4">
      <div className="splendor-game-panel">
        <p className="splendor-eyebrow mb-6 text-center">The merchant&apos;s court</p>
        <GameBoard gameData={gameData} currentPlayerId={currentPlayerId} />
      </div>
    </main>
  );
}
