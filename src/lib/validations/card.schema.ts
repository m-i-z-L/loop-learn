import { z } from 'zod';

export const createCardSchema = z.object({
  deckId: z.string().cuid(),
  cardType: z.enum(['qa', 'cloze', 'code', 'freewrite']),
  front: z.string().min(1, '問題面を入力してください').max(2000, '問題面は2000文字以内にしてください'),
  back: z.string().max(2000, '答え面は2000文字以内にしてください'),
  tags: z.array(z.string().max(50, 'タグは50文字以内にしてください')).max(10, 'タグは最大10個まで設定できます').default([]),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = createCardSchema.partial().omit({ deckId: true });
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
