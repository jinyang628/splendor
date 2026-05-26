'use client';

import { use, useEffect, useState } from 'react';

import { fetchGameData } from '@/actions/games/fetchGameData';
import { toast } from 'sonner';

import GameBoard from '@/components/game/game-board';
import GemChip from '@/components/shared/game/gem-chip';

import { CARD_COLORS } from '@/types/cards';
import type { FetchGameDataResponse } from '@/types/games';

import { getCurrentUserId, supabase } from '@/lib/supabase';

type GamePageProps = { params: Promise<{ gameId: string }> };

const LOADER_GEM_POSITIONS = [
  'top-0 left-1/2 -translate-x-1/2',
  'top-8 right-2',
  'right-7 bottom-2',
  'bottom-2 left-7',
  'top-8 left-2',
] as const;

function GameLoadingScreen() {
  return (
    <main className="flex min-h-[70vh] w-full flex-1 items-center justify-center px-2 py-4 sm:px-4">
      <section className="splendor-game-loader" aria-busy="true" aria-live="polite">
        <div className="splendor-game-loader__halo" aria-hidden />

        <div className="splendor-game-loader__emblem" aria-hidden>
          <div className="splendor-game-loader__orbit">
            {CARD_COLORS.map((color, index) => (
              <span
                key={color}
                className={`splendor-game-loader__gem ${LOADER_GEM_POSITIONS[index]}`}
              >
                <GemChip color={color} prominent />
              </span>
            ))}
          </div>
          <div className="splendor-game-loader__core">
            <span className="splendor-game-loader__spark" />
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-col items-center gap-3">
          <p className="splendor-eyebrow">Preparing the table</p>
          <p className="splendor-game-loader__text">Shuffling nobles and polishing gems...</p>
        </div>

        <div className="splendor-game-loader__progress" aria-hidden />
      </section>
    </main>
  );
}

export default function GamePage({ params }: GamePageProps) {
  const { gameId } = use(params);
  const [gameData, setGameData] = useState<FetchGameDataResponse | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const refreshGameData = async () => {
      try {
        const data = await fetchGameData(gameId);
        if (!cancelled) setGameData(data);
      } catch (error) {
        if (!cancelled) toast.error('Failed to refresh game');
        console.error(error);
      }
    };

    const scheduleRefreshGameData = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(refreshGameData, 120);
    };

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

    const channel = supabase
      .channel(`game-data-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        scheduleRefreshGameData,
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (refreshTimeout) clearTimeout(refreshTimeout);
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  if (isLoading) {
    return <GameLoadingScreen />;
  }

  if (!gameData) {
    return <p className="text-muted-foreground text-center text-sm">Could not load this game.</p>;
  }

  return (
    <main className="flex w-full flex-1 items-start justify-center px-2 py-2 sm:px-4">
      <div className="splendor-game-panel">
        <GameBoard
          gameId={gameId}
          gameData={gameData}
          currentPlayerId={currentPlayerId}
          onGameDataChange={setGameData}
        />
      </div>
    </main>
  );
}
