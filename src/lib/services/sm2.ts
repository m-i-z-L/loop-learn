import type { Rating } from '@/types/card';

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * SM-2間隔反復アルゴリズムの実装。
 * カードの自己評価 (Rating 1〜4) に基づいて次回復習スケジュールを計算する。
 *
 * EF更新式: ΔEF = 0.1 * (rating - 3)
 * 正解 (rating >= 3): repetitions++, interval を SM-2 式で増加
 * 不正解 (rating < 3): repetitions=0, interval=1 にリセット
 */
export class SM2Service {
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly MAX_EASE_FACTOR = 2.5;

  /**
   * SM-2アルゴリズムで次回復習スケジュールを計算する。
   *
   * @param params - 現在の SM-2 パラメータ (easeFactor, interval, repetitions)
   * @param rating - ユーザーの自己評価 (1=全然わからない〜4=完璧)
   * @returns 更新後の SM-2 パラメータと次回復習日
   */
  calculate(
    params: { easeFactor: number; interval: number; repetitions: number },
    rating: Rating,
  ): SM2Result {
    // EF 更新: ΔEF = 0.1 * (rating - 3)
    // rating=1: -0.20 / rating=2: -0.10 / rating=3: 0.00 / rating=4: +0.10
    const deltaEF = 0.1 * (rating - 3);
    const newEaseFactor = Math.min(
      SM2Service.MAX_EASE_FACTOR,
      Math.max(SM2Service.MIN_EASE_FACTOR, params.easeFactor + deltaEF),
    );

    let newRepetitions: number;
    let newInterval: number;

    if (rating >= 3) {
      // 正解: repetitions を増やし、SM-2 式でインターバルを更新
      newRepetitions = params.repetitions + 1;
      if (params.repetitions === 0) {
        newInterval = 1;
      } else if (params.repetitions === 1) {
        newInterval = 6;
      } else {
        // rep >= 2: 前回インターバル × 新しい EF
        newInterval = Math.round(params.interval * newEaseFactor);
      }
    } else {
      // 不正解: 最初から学び直し
      newRepetitions = 0;
      newInterval = 1;
    }

    // nextReviewDate = 今日の0時 + newInterval 日
    const nextReviewDate = new Date();
    nextReviewDate.setHours(0, 0, 0, 0);
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate,
    };
  }
}
