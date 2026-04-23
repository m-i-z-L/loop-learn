import { z } from 'zod';

export const reviewCardSchema = z.object({
  rating: z.number().int().min(1).max(4),
});

export type ReviewCardInput = z.infer<typeof reviewCardSchema>;
