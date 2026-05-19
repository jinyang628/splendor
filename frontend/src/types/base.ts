import { z } from 'zod';

export const playerEnum = z.enum(['player_one', 'player_two', 'player_three', 'player_four']);

export type Player = z.infer<typeof playerEnum>;
