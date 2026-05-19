import { z } from 'zod';

export const cardColorSchema = z.enum(['black', 'blue', 'white', 'green', 'red']);
export type CardColor = z.infer<typeof cardColorSchema>;
export const CARD_COLORS = cardColorSchema.options;

const cardLevels = [1, 2, 3] as const;
export const cardLevelSchema = z.union([
  z.literal(cardLevels[0]),
  z.literal(cardLevels[1]),
  z.literal(cardLevels[2]),
]);
export type CardLevel = z.infer<typeof cardLevelSchema>;
export const CARD_LEVELS = cardLevels;

export const costGemOrderSchema = z.tuple([
  z.literal('black'),
  z.literal('blue'),
  z.literal('green'),
  z.literal('red'),
  z.literal('white'),
]);
export const COST_GEM_ORDER = costGemOrderSchema.parse([
  'black',
  'blue',
  'green',
  'red',
  'white',
] as const);

export const gemCostSchema = z.object({
  black: z.number().int().min(0),
  blue: z.number().int().min(0),
  green: z.number().int().min(0),
  red: z.number().int().min(0),
  white: z.number().int().min(0),
});

export const cardDataSchema = gemCostSchema.extend({
  color: cardColorSchema,
  pointValues: z.number().int().min(0),
});

export type CardData = z.infer<typeof cardDataSchema>;

export function getNonZeroGemCosts(costs: z.infer<typeof gemCostSchema>) {
  return COST_GEM_ORDER.map((gem) => ({
    gem,
    count: costs[gem],
  })).filter(({ count }) => count > 0);
}
