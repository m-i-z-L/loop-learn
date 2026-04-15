import { auth } from '@/lib/auth';
import { createCardSchema } from '@/lib/validations/card.schema';
import { createCard } from '@/lib/services/card';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCardSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const card = await createCard(session.user.id, parsed.data);
  if (!card) {
    return Response.json({ error: 'Deck not found or access denied' }, { status: 404 });
  }
  return Response.json(card, { status: 201 });
}
