import type { GemCounts } from '@/types/cards';
import type { FetchGameDataResponse, GameCard, GameNoble } from '@/types/games';

export type PlayerInOrder = {
  playerId: string;
  position: number;
  nickname: string;
  points: number;
  gemsOwned: GemCounts;
  noblesOwned: GameNoble[];
  reservedCards: GameCard[];
  purchasedCards: GameCard[];
};

/** Display rows top-to-bottom: level 3, then 2, then 1. */
export const BOARD_LEVELS = ['3', '2', '1'] as const;
export type BoardLevel = (typeof BOARD_LEVELS)[number];

export function getPlayerPoints(cards: GameCard[], nobles: GameNoble[] = []): number {
  return (
    cards.reduce((total, card) => total + card.points, 0) +
    nobles.reduce((total, noble) => total + noble.points, 0)
  );
}

export function getPlayersInOrder(data: FetchGameDataResponse): PlayerInOrder[] {
  return Object.entries(data.order)
    .sort(([, a], [, b]) => a - b)
    .map(([playerId, position]) => ({
      playerId,
      position,
      nickname: data.nicknames[playerId],
      points: getPlayerPoints(data.purchased[playerId] ?? [], data.nobles_owned[playerId] ?? []),
      gemsOwned: data.gems_owned[playerId],
      noblesOwned: data.nobles_owned[playerId] ?? [],
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
