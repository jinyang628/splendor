import type { FetchGameDataResponse } from '@/types/games';

export type PlayerInOrder = {
  playerId: string;
  position: number;
  nickname: string;
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
    }));
}
