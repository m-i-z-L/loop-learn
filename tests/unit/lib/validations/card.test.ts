import { describe, it, expect } from 'vitest';
import { createCardSchema } from '@/lib/validations/card.schema';

const VALID_DECK_ID = 'cm0000000000000000000000';

describe('createCardSchema', () => {
  describe('正常ケース', () => {
    it('qa タイプで有効なデータを受け入れる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: 'TypeScriptのジェネリクスとは？',
        back: '型をパラメータとして受け取る機能',
        tags: ['typescript'],
      });
      expect(result.success).toBe(true);
    });

    it('cloze タイプで有効なデータを受け入れる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'cloze',
        front: '{{TypeScript}} は {{JavaScript}} のスーパーセットです',
        back: 'TypeScript は JavaScript のスーパーセットです',
        tags: [],
      });
      expect(result.success).toBe(true);
    });

    it('code タイプで有効なデータを受け入れる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'code',
        front: '```typescript\nconst x: ____ = 42;\n```',
        back: '```typescript\nconst x: number = 42;\n```',
        tags: ['typescript', 'basics'],
      });
      expect(result.success).toBe(true);
    });

    it('freewrite タイプで back が空でも受け入れる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'freewrite',
        front: 'Reactのレンダリング最適化について説明してください',
        back: '',
        tags: [],
      });
      expect(result.success).toBe(true);
    });

    it('tags が省略されたときデフォルト値 [] になる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: '問題',
        back: '答え',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it('tags が最大10個のとき受け入れる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: '問題',
        back: '答え',
        tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('エラーケース', () => {
    it('front が空文字のときエラーになる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: '',
        back: '答え',
        tags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.front).toBeDefined();
      }
    });

    it('front が2001文字を超えるときエラーになる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: 'a'.repeat(2001),
        back: '答え',
        tags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.front).toBeDefined();
      }
    });

    it('back が2001文字を超えるときエラーになる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: '問題',
        back: 'a'.repeat(2001),
        tags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.back).toBeDefined();
      }
    });

    it('deckId が cuid 形式でないときエラーになる', () => {
      const result = createCardSchema.safeParse({
        deckId: 'not-a-valid-cuid',
        cardType: 'qa',
        front: '問題',
        back: '答え',
        tags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.deckId).toBeDefined();
      }
    });

    it('tags が11個を超えるときエラーになる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'qa',
        front: '問題',
        back: '答え',
        tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.tags).toBeDefined();
      }
    });

    it('cardType が不正な値のときエラーになる', () => {
      const result = createCardSchema.safeParse({
        deckId: VALID_DECK_ID,
        cardType: 'invalid',
        front: '問題',
        back: '答え',
        tags: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.cardType).toBeDefined();
      }
    });
  });
});
