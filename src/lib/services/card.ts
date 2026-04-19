import { prisma } from '@/lib/prisma';
import type { CreateCardInput } from '@/lib/validations/card.schema';
import type { Card } from '@/types/card';

export async function createCard(userId: string, data: CreateCardInput): Promise<Card | null> {
  // deckIdがこのユーザーのものか確認（他ユーザーのデッキへのカード作成を防止）
  const deck = await prisma.deck.findFirst({
    where: { id: data.deckId, userId },
  });
  if (!deck) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const card = await prisma.card.create({
    data: {
      userId,
      deckId: data.deckId,
      cardType: data.cardType,
      front: data.front,
      back: data.back,
      tags: data.tags,
      // SM-2初期値
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: today,
    },
  });

  return card as Card;
}

export async function getCardById(userId: string, cardId: string): Promise<Card | null> {
  const card = await prisma.card.findFirst({
    where: { id: cardId, userId },
  });
  return card as Card | null;
}

export async function getCardsByDeck(userId: string, deckId: string): Promise<Card[]> {
  const cards = await prisma.card.findMany({
    where: { deckId, userId },
    orderBy: { createdAt: 'desc' },
  });
  return cards as Card[];
}
