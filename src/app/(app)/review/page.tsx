import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTodayReviewCards } from '@/lib/services/card';
import { getDeckById } from '@/lib/services/deck';
import ReviewSession from '@/components/review/ReviewSession';

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ deckId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { deckId } = await searchParams;
  // getDeckById はデッキ情報の補助取得のため、失敗してもカード表示を優先して null にフォールバックする
  const cardsPromise = getTodayReviewCards(session.user.id, deckId);
  const deckPromise = deckId
    ? getDeckById(deckId, session.user.id).catch(() => null)
    : Promise.resolve(null);
  const [cards, deck] = await Promise.all([cardsPromise, deckPromise]);

  const backHref = deckId ? `/decks/${deckId}` : '/dashboard';

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">今日の復習はありません</h1>
        <p className="text-gray-500 mb-8">お疲れ様です。また明日復習しましょう。</p>
        <Link
          href={backHref}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {deckId ? 'デッキに戻る' : 'ダッシュボードへ'}
        </Link>
      </div>
    );
  }

  const title = deck ? `${deck.icon} ${deck.name}` : '復習セッション';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <Link
          href={backHref}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          中断する
        </Link>
      </div>
      <ReviewSession cards={cards} deckId={deckId} />
    </div>
  );
}
