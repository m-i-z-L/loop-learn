'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GeneratedCard } from '@/lib/services/ai';
import GeneratedCardItem from './GeneratedCardItem';

interface GeneratedCardListProps {
  cards: GeneratedCard[];
  deckId: string;
  onCardsChange: (cards: GeneratedCard[]) => void;
}

export default function GeneratedCardList({ cards, deckId, onCardsChange }: GeneratedCardListProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (index: number, updated: GeneratedCard) => {
    const next = cards.map((c, i) => (i === index ? updated : c));
    onCardsChange(next);
  };

  const handleDelete = (index: number) => {
    onCardsChange(cards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const results = await Promise.allSettled(
        cards.map((card) =>
          fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deckId,
              cardType: 'qa',
              front: card.front,
              back: card.back,
              tags: [],
            }),
          }),
        ),
      );

      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));
      if (failed.length > 0) {
        setError(`${failed.length}枚のカードの保存に失敗しました。再度お試しください。`);
        return;
      }

      router.push(`/decks/${deckId}`);
    } catch {
      setError('通信エラーが発生しました。再度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800">
        生成されたカード ({cards.length}枚)
      </h2>

      <div className="space-y-3">
        {cards.map((card, index) => (
          <GeneratedCardItem
            key={index}
            card={card}
            onChange={(updated) => handleChange(index, updated)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || cards.length === 0}
        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            保存中...
          </>
        ) : (
          `保存 (${cards.length}枚)`
        )}
      </button>
    </div>
  );
}
