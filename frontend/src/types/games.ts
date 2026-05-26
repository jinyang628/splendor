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

export const reserveCardRequestSchema = z
  .object({
    game_id: z.string(),
    player_id: z.string(),
    source: z.enum(['open', 'closed']),
    card_id: z.string().uuid().optional(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  })
  .refine((request) => request.source !== 'open' || Boolean(request.card_id), {
    message: 'Open card reservations require a card id',
    path: ['card_id'],
  })
  .refine((request) => request.source !== 'closed' || Boolean(request.level), {
    message: 'Closed deck reservations require a level',
    path: ['level'],
  });

export type ReserveCardRequest = z.infer<typeof reserveCardRequestSchema>;

export const buyCardRequestSchema = z.object({
  game_id: z.string(),
  player_id: z.string(),
  card_id: z.string().uuid(),
});

export type BuyCardRequest = z.infer<typeof buyCardRequestSchema>;

export const gameCardSchema = gemCountsSchema.extend({
  id: z.string().uuid(),
  color: cardColorSchema,
  points: z.number().int().min(0),
});

export type GameCard = z.infer<typeof gameCardSchema>;

export const gameEndStateSchema = z.object({
  status: z.enum(['playing', 'final_turns', 'completed']),
  triggered_by_player_id: z.string().nullable(),
  final_turn: z.number().int().nullable(),
  winner_player_id: z.string().nullable(),
});

export type GameEndState = z.infer<typeof gameEndStateSchema>;

const cardsByLevelSchema = z.record(z.enum(['1', '2', '3']), z.array(gameCardSchema));
const openCardsByLevelSchema = z.record(
  z.enum(['1', '2', '3']),
  z.array(gameCardSchema.nullable()),
);

export const fetchGameDataResponseSchema = z.object({
  turn: z.number().int(),
  endgame: gameEndStateSchema,
  order: z.record(z.string(), z.number().int()),
  nicknames: z.record(z.string(), z.string()),
  gems_available: gemCountsSchema,
  gems_owned: z.record(z.string(), gemCountsSchema),
  reserved: z.record(z.string(), z.array(gameCardSchema)),
  purchased: z.record(z.string(), z.array(gameCardSchema)),
  closed: cardsByLevelSchema,
  open: openCardsByLevelSchema,
});

export type FetchGameDataResponse = z.infer<typeof fetchGameDataResponseSchema>;
