import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDecksByUser } from '@/lib/services/deck';

/**
 * ダッシュボードページ。
 * 今日の復習予定カード総数を表示し、M3で実装する復習セッションへの導線を提供する。
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const decks = await getDecksByUser(session.user.id);

  const totalDueCards = decks.reduce((sum, deck) => sum + deck.dueCards, 0);
  const totalCards = decks.reduce((sum, deck) => sum + deck.totalCards, 0);

  const decksWithDue = decks.filter((d) => d.dueCards > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* 今日の復習カード */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1">今日の復習予定</p>
        <p className="text-5xl font-bold text-blue-600 mb-1">
          {totalDueCards}
          <span className="text-lg font-normal text-gray-500 ml-2">枚</span>
        </p>
        <p className="text-sm text-gray-400">総カード数: {totalCards}枚</p>

        {totalDueCards > 0 ? (
          <Link
            href="/review"
            className="mt-4 block w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            全デッキを復習する
          </Link>
        ) : (
          <p className="mt-4 text-sm text-center text-gray-400">今日の復習はありません</p>
        )}
      </div>

      {/* デッキ別復習 */}
      {decksWithDue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">デッキ別復習</h2>
          <ul className="space-y-2">
            {decksWithDue.map((deck) => (
              <li key={deck.id}>
                <Link
                  href={`/review?deckId=${deck.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-800">
                    <span>{deck.icon}</span>
                    <span className="font-medium">{deck.name}</span>
                  </span>
                  <span className="text-sm font-medium text-blue-600">{deck.dueCards}枚</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* クイックリンク */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/decks"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">📚</p>
          <p className="font-medium text-gray-900">デッキ一覧</p>
          <p className="text-sm text-gray-500">{decks.length}個のデッキ</p>
        </Link>

        <Link
          href="/cards/new"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <p className="text-2xl mb-2">✏️</p>
          <p className="font-medium text-gray-900">カード作成</p>
          <p className="text-sm text-gray-500">新しいカードを追加</p>
        </Link>
      </div>
    </div>
  );
}
