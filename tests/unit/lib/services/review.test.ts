import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prismaをモック化
vi.mock('@/lib/prisma', () => ({
  prisma: {
    card: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    reviewLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { reviewCard } from '@/lib/services/review';
import { prisma } from '@/lib/prisma';

const CARD_ID = 'cm9999999999999999999999';
const USER_ID = 'cm1111111111111111111111';
const DECK_ID = 'cm0000000000000000000000';

const mockCard = {
  id: CARD_ID,
  userId: USER_ID,
  deckId: DECK_ID,
  cardType: 'qa' as const,
  front: 'TypeScriptのジェネリクスとは？',
  back: '型をパラメータとして受け取る機能',
  tags: ['typescript'],
  easeFactor: 2.5,
  interval: 1,
  repetitions: 1,
  nextReviewDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('reviewCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('カードが存在する場合、SM-2 パラメータを更新し更新後の Card を返す', async () => {
    // Given: カード存在 & トランザクション成功
    vi.mocked(prisma.card.findFirst).mockResolvedValue(mockCard);

    const updatedCard = {
      ...mockCard,
      repetitions: 2,
      interval: 6,
      nextReviewDate: new Date(),
    };
    vi.mocked(prisma.$transaction).mockResolvedValue([updatedCard, {}]);

    // When
    const result = await reviewCard(USER_ID, CARD_ID, 3);

    // Then: 更新後のカードが返る
    expect(result).not.toBeNull();
    expect(result?.id).toBe(CARD_ID);

    // トランザクションが呼ばれた
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('カードが存在しない場合、null を返しトランザクションを呼ばない', async () => {
    // Given: カード不存在
    vi.mocked(prisma.card.findFirst).mockResolvedValue(null);

    // When
    const result = await reviewCard(USER_ID, CARD_ID, 3);

    // Then
    expect(result).toBeNull();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('他ユーザーのカードにアクセスした場合、null を返す', async () => {
    // Given: userId が一致しないため findFirst が null を返す
    vi.mocked(prisma.card.findFirst).mockResolvedValue(null);

    // When
    const result = await reviewCard('other-user-id', CARD_ID, 4);

    // Then
    expect(result).toBeNull();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
