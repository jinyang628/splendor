import { z } from 'zod';

export const initializeRequestSchema = z.object({
  game_id: z.string(),
});

export type InitializeRequest = z.infer<typeof initializeRequestSchema>;
