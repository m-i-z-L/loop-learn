export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

/** デッキに今日の復習枚数・総カード数を加えた表示用型 */
export interface DeckWithStats extends Deck {
  totalCards: number;
  dueCards: number;
}
