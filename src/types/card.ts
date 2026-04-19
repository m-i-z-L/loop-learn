export type CardType = 'qa' | 'cloze' | 'code' | 'freewrite';

export interface Card {
  id: string;
  deckId: string;
  userId: string;
  cardType: CardType;
  front: string;
  back: string;
  tags: string[];
  // SM-2パラメータ
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** AI自動生成カード（保存前の一時オブジェクト） */
export interface GeneratedCard {
  cardType: CardType;
  front: string;
  back: string;
  tags: string[];
}
