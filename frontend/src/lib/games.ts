import type { GemCounts } from '@/types/cards';
import type { FetchGameDataResponse, GameCard } from '@/types/games';

export type PlayerInOrder = {
  playerId: string;
  position: number;
  nickname: string;
  gemsOwned: GemCounts;
  reservedCards: GameCard[];
  purchasedCards: GameCard[];
};

/** Display rows top-to-bottom: level 3, then 2, then 1. */
export const BOARD_LEVELS = ['3', '2', '1'] as const;
export type BoardLevel = (typeof BOARD_LEVELS)[number];

export function getPlayersInOrder(data: FetchGameDataResponse): PlayerInOrder[] {
  return Object.entries(data.order)
    .sort(([, a], [, b]) => a - b)
    .map(([playerId, position]) => ({
      playerId,
      position,
      nickname: data.nicknames[playerId],
      gemsOwned: data.gems_owned[playerId],
      reservedCards: data.reserved[playerId] ?? [],
      purchasedCards: data.purchased[playerId] ?? [],
    }));
}

export function getCurrentTurnPlayerId(data: FetchGameDataResponse): string | null {
  const players = getPlayersInOrder(data);
  if (players.length === 0) return null;

  const turnIndex = (data.turn - 1) % players.length;
  return players[turnIndex]?.playerId ?? null;
}
