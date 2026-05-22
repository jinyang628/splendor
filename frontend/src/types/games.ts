import { z } from 'zod';

import { cardColorSchema, gemCountsSchema } from '@/types/cards';

export const initializeRequestSchema = z.object({
  game_id: z.string(),
});

export type InitializeRequest = z.infer<typeof initializeRequestSchema>;

export const fetchGameDataRequestSchema = z.object({
  game_id: z.string(),
});

export type FetchGameDataRequest = z.infer<typeof fetchGameDataRequestSchema>;

export const takeGemsRequestSchema = z.object({
  game_id: z.string(),
  player_id: z.string(),
  selected_gems: gemCountsSchema,
});

export type TakeGemsRequest = z.infer<typeof takeGemsRequestSchema>;

export const discardGemsRequestSchema = z.object({
  game_id: z.string(),
  player_id: z.string(),
  discarded_gems: gemCountsSchema,
});

export type DiscardGemsRequest = z.infer<typeof discardGemsRequestSchema>;

export const gameCardSchema = gemCountsSchema.extend({
  id: z.string().uuid(),
  color: cardColorSchema,
  points: z.number().int().min(0),
});

export type GameCard = z.infer<typeof gameCardSchema>;

const cardsByLevelSchema = z.record(z.enum(['1', '2', '3']), z.array(gameCardSchema));

export const fetchGameDataResponseSchema = z.object({
  order: z.record(z.string(), z.number().int()),
  nicknames: z.record(z.string(), z.string()),
  gems_available: gemCountsSchema,
  gems_owned: z.record(z.string(), gemCountsSchema),
  closed: cardsByLevelSchema,
  open: cardsByLevelSchema,
});

export type FetchGameDataResponse = z.infer<typeof fetchGameDataResponseSchema>;
