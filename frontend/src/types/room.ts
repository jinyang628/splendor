import { z } from 'zod';

export const getPlayerNumberRequestSchema = z.object({
  game_id: z.string(),
  user_id: z.string(),
});

export type GetPlayerNumberRequest = z.infer<typeof getPlayerNumberRequestSchema>;

export const getPlayerNumberResponseSchema = z.object({
  is_player_one: z.boolean(),
});

export type GetPlayerNumberResponse = z.infer<typeof getPlayerNumberResponseSchema>;

export const roomRequestSchema = z.object({
  game_id: z.string(),
  player_id: z.string(),
});

export type RoomRequest = z.infer<typeof roomRequestSchema>;

export const roomStatusEnum = z.enum(['waiting', 'planning', 'active', 'finished']);

export type RoomStatus = z.infer<typeof roomStatusEnum>;
