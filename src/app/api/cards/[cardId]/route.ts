import { auth } from '@/lib/auth';
import { updateCardSchema } from '@/lib/validations/card.schema';
import { getCardById, updateCard, deleteCard } from '@/lib/services/card';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cardId } = await params;
  const card = await getCardById(session.user.id, cardId);
  if (!card) {
    return Response.json({ error: 'Card not found' }, { status: 404 });
  }
  return Response.json(card);
}

export async function PATCH(
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

  const parsed = updateCardSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { cardId } = await params;
  try {
    const card = await updateCard(session.user.id, cardId, parsed.data);
    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }
    return Response.json(card);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cardId } = await params;
  try {
    const deleted = await deleteCard(session.user.id, cardId);
    if (!deleted) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
