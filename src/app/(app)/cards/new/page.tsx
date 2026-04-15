import CardEditor from '@/components/cards/CardEditor';
import type { Deck } from '@/types/deck';

async function getDecks(): Promise<Deck[]> {
  // 認証・DB接続実装前の暫定処置: 空配列を返す
  // TODO: auth()でユーザーIDを取得し、prisma.deck.findManyで取得する
  try {
    const { prisma } = await import('@/lib/prisma');
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    if (!session?.user?.id) return [];

    const decks = await prisma.deck.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return decks as Deck[];
  } catch {
    // 開発環境でDB未接続の場合のフォールバック
    return [];
  }
}

export default async function NewCardPage({
  searchParams,
}: {
  searchParams: Promise<{ deckId?: string }>;
}) {
  const params = await searchParams;
  const decks = await getDecks();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新しいカードを作成</h1>
      <CardEditor decks={decks} defaultDeckId={params.deckId} />
    </div>
  );
}
