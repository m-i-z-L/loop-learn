import { prisma } from '@/lib/prisma';
import { SM2Service } from '@/lib/services/sm2';
import { getCardById } from '@/lib/services/card';
import type { Rating, Card } from '@/types/card';

const sm2Service = new SM2Service();

/**
 * カードを復習し、SM-2アルゴリズムで次回スケジュールを更新する。
 * Card の SM-2 パラメータ更新と ReviewLog 作成をトランザクションで原子的に実行する。
 *
 * @param userId - 操作するユーザーの ID（所有権検証に使用）
 * @param cardId - 復習対象カードの ID
 * @param rating - ユーザーの自己評価 (1〜4)
 * @returns 更新後の Card、カードが存在しない場合は null
 */
export async function reviewCard(
  userId: string,
  cardId: string,
  rating: Rating,
): Promise<Card | null> {
  const card = await getCardById(userId, cardId);
  if (!card) return null;

  const result = sm2Service.calculate(card, rating);

  const [updatedCard] = await prisma.$transaction([
    prisma.card.update({
      where: { id: cardId },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewDate: result.nextReviewDate,
      },
    }),
    prisma.reviewLog.create({
      data: {
        cardId,
        userId,
        rating,
        previousInterval: card.interval,
        newInterval: result.interval,
      },
    }),
  ]);

  return updatedCard as Card;
}
