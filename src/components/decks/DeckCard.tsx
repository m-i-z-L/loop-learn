import Link from 'next/link';
import type { DeckWithStats } from '@/types/deck';

interface DeckCardProps {
  deck: DeckWithStats;
}

export default function DeckCard({ deck }: DeckCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
      <Link
        href={`/decks/${deck.id}`}
        className="block p-5"
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none">{deck.icon}</span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{deck.name}</h2>
            {deck.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{deck.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span>{deck.totalCards} 枚</span>
              {deck.dueCards > 0 && (
                <span className="text-orange-600 font-medium">今日 {deck.dueCards} 枚</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      {deck.dueCards > 0 && (
        <div className="px-5 pb-4">
          <Link
            href={`/review?deckId=${deck.id}`}
            className="block w-full py-2 text-sm font-medium text-center text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            復習する ({deck.dueCards}枚)
          </Link>
        </div>
      )}
    </div>
  );
}
