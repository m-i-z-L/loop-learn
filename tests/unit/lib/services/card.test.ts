import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prismaをモック化
vi.mock('@/lib/prisma', () => ({
  prisma: {
    deck: {
      findFirst: vi.fn(),
    },
    card: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { createCard, updateCard, deleteCard } from '@/lib/services/card';
import { prisma } from '@/lib/prisma';
import type { CreateCardInput } from '@/lib/validations/card.schema';

const VALID_DECK_ID = 'cm0000000000000000000000';
const VALID_USER_ID = 'cm1111111111111111111111';

const mockCardInput: CreateCardInput = {
  deckId: VALID_DECK_ID,
  cardType: 'qa',
  front: 'TypeScriptのジェネリクスとは？',
  back: '型をパラメータとして受け取る機能',
  tags: ['typescript'],
};

describe('createCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SM-2の初期値を正しく設定してカードを作成する', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockCreatedCard = {
      id: 'cm9999999999999999999999',
      userId: VALID_USER_ID,
      deckId: VALID_DECK_ID,
      cardType: 'qa' as const,
      front: mockCardInput.front,
      back: mockCardInput.back,
      tags: mockCardInput.tags,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.card.create).mockResolvedValue(mockCreatedCard);

    const result = await createCard(VALID_USER_ID, mockCardInput);

    expect(prisma.card.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: VALID_USER_ID,
          deckId: VALID_DECK_ID,
          cardType: 'qa',
          front: mockCardInput.front,
          back: mockCardInput.back,
          tags: mockCardInput.tags,
          // SM-2初期値
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
        }),
      })
    );

    expect(result).toEqual(mockCreatedCard);
  });

  it('nextReviewDate が今日の日付 (00:00:00) で設定される', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mockCreatedCard = {
      id: 'cm9999999999999999999999',
      userId: VALID_USER_ID,
      deckId: VALID_DECK_ID,
      cardType: 'qa' as const,
      front: mockCardInput.front,
      back: mockCardInput.back,
      tags: [] as string[],
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: today,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.card.create).mockResolvedValue(mockCreatedCard);

    await createCard(VALID_USER_ID, mockCardInput);

    const createCall = vi.mocked(prisma.card.create).mock.calls[0][0];
    const nextReviewDate = createCall.data.nextReviewDate as Date;

    expect(nextReviewDate.getHours()).toBe(0);
    expect(nextReviewDate.getMinutes()).toBe(0);
    expect(nextReviewDate.getSeconds()).toBe(0);
    expect(nextReviewDate.getMilliseconds()).toBe(0);
  });

  it('freewrite タイプで back が空文字でも作成できる', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const freewriteInput: CreateCardInput = {
      ...mockCardInput,
      cardType: 'freewrite',
      back: '',
    };

    const mockCreatedCard = {
      id: 'cm9999999999999999999999',
      userId: VALID_USER_ID,
      deckId: VALID_DECK_ID,
      cardType: 'freewrite' as const,
      front: freewriteInput.front,
      back: '',
      tags: [] as string[],
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.card.create).mockResolvedValue(mockCreatedCard);

    const result = await createCard(VALID_USER_ID, freewriteInput);

    expect(result).not.toBeNull();
    expect(result!.back).toBe('');
  });

  it('deckIdが別ユーザーのもののとき null を返す', async () => {
    // deck が見つからない（別ユーザーのdeck）
    vi.mocked(prisma.deck.findFirst).mockResolvedValue(null);

    const result = await createCard(VALID_USER_ID, mockCardInput);

    expect(result).toBeNull();
    expect(prisma.card.create).not.toHaveBeenCalled();
  });

  it('Prismaがエラーをスローしたとき、そのまま伝播する', async () => {
    vi.mocked(prisma.deck.findFirst).mockResolvedValue({
      id: VALID_DECK_ID,
      userId: VALID_USER_ID,
      name: 'Test Deck',
      description: null,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.card.create).mockRejectedValue(new Error('DB connection failed'));

    await expect(createCard(VALID_USER_ID, mockCardInput)).rejects.toThrow('DB connection failed');
  });
});

const CARD_ID = 'cm2222222222222222222222';

const baseCard = {
  id: CARD_ID,
  userId: VALID_USER_ID,
  deckId: VALID_DECK_ID,
  cardType: 'qa' as const,
  front: 'TypeScriptのジェネリクスとは？',
  back: '型をパラメータとして受け取る機能',
  tags: ['typescript'],
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  nextReviewDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('updateCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('カードを更新して返す', async () => {
    vi.mocked(prisma.card.findFirst).mockResolvedValue(baseCard);
    const updated = { ...baseCard, front: '更新後の問題', updatedAt: new Date() };
    vi.mocked(prisma.card.update).mockResolvedValue(updated);

    const result = await updateCard(VALID_USER_ID, CARD_ID, { front: '更新後の問題' });

    expect(prisma.card.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: CARD_ID } }),
    );
    expect(result!.front).toBe('更新後の問題');
  });

  it('カードが存在しないとき null を返す', async () => {
    vi.mocked(prisma.card.findFirst).mockResolvedValue(null);

    const result = await updateCard(VALID_USER_ID, CARD_ID, { front: '更新後の問題' });

    expect(result).toBeNull();
    expect(prisma.card.update).not.toHaveBeenCalled();
  });
});

describe('deleteCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('カードを削除して true を返す', async () => {
    vi.mocked(prisma.card.findFirst).mockResolvedValue(baseCard);
    vi.mocked(prisma.card.delete).mockResolvedValue(baseCard);

    const result = await deleteCard(VALID_USER_ID, CARD_ID);

    expect(prisma.card.delete).toHaveBeenCalledWith({ where: { id: CARD_ID } });
    expect(result).toBe(true);
  });

  it('カードが存在しないとき false を返す', async () => {
    vi.mocked(prisma.card.findFirst).mockResolvedValue(null);

    const result = await deleteCard(VALID_USER_ID, CARD_ID);

    expect(result).toBe(false);
    expect(prisma.card.delete).not.toHaveBeenCalled();
  });
});
