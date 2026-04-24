import { auth } from '@/lib/auth';
import { getUserStats, getHeatmapData } from '@/lib/services/stats';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [stats, heatmap] = await Promise.all([
      getUserStats(session.user.id),
      getHeatmapData(session.user.id, 30),
    ]);
    return Response.json({ stats, heatmap });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
