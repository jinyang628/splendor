'use client';

import { use, useEffect, useState } from 'react';

import { fetchGameData } from '@/actions/games/fetchGameData';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Card from '@/components/shared/game/card';

import type { FetchGameDataResponse } from '@/types/games';

type GamePageProps = { params: Promise<{ gameId: string }> };

export default function GamePage({ params }: GamePageProps) {
  const { gameId } = use(params);
  const [gameData, setGameData] = useState<FetchGameDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchGameData(gameId);
        if (!cancelled) setGameData(data);
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const firstOpenCard = gameData?.open['1']?.[0];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {firstOpenCard ? (
        <Card
          color={firstOpenCard.color}
          pointValues={firstOpenCard.points}
          black={firstOpenCard.black}
          blue={firstOpenCard.blue}
          green={firstOpenCard.green}
          red={firstOpenCard.red}
          white={firstOpenCard.white}
        />
      ) : (
        <Card color="blue" pointValues={1} black={0} blue={2} green={3} red={0} white={3} />
      )}
    </div>
  );
}
