import { auth } from '@/lib/auth';
import { reviewCardSchema } from '@/lib/validations/review.schema';
import { reviewCard } from '@/lib/services/review';
import type { Rating } from '@/types/card';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = reviewCardSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { cardId } = await params;
  try {
    // Zod で 1〜4 の整数であることを検証済みのため Rating 型にキャスト
    const card = await reviewCard(session.user.id, cardId, parsed.data.rating as Rating);
    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }
    return Response.json(card);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
