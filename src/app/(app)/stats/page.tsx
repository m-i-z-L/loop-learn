import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserStats, getHeatmapData } from '@/lib/services/stats';
import HeatmapCalendar from '@/components/stats/HeatmapCalendar';
import MasteryDistribution from '@/components/stats/MasteryDistribution';
import WeeklyBar from '@/components/stats/WeeklyBar';

/**
 * 学習進捗ダッシュボードページ。
 * ストリーク・ヒートマップ・習熟度分布・週別復習回数を表示する。
 */
export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [stats, heatmap] = await Promise.all([
    getUserStats(session.user.id),
    getHeatmapData(session.user.id, 30),
  ]);

  const { totalCards, totalReviews, streak, masteryDistribution } = stats;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">学習進捗</h1>

      {/* ストリーク & サマリー数字 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 rounded-xl p-4 text-center col-span-1">
          <p className="text-3xl font-bold text-orange-500">🔥 {streak}</p>
          <p className="text-xs text-gray-500 mt-1">連続学習日数</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalCards}</p>
          <p className="text-xs text-gray-500 mt-1">総カード数</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-gray-700">{totalReviews}</p>
          <p className="text-xs text-gray-500 mt-1">累計復習回数</p>
        </div>
      </div>

      {/* 習熟度分布 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">習熟度分布</h2>
        <MasteryDistribution distribution={masteryDistribution} total={totalCards} />
      </div>

      {/* 学習カレンダー（ヒートマップ） */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">過去30日の学習記録</h2>
        <HeatmapCalendar heatmap={heatmap} />
      </div>

      {/* 週別復習回数 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">週別復習回数（直近4週）</h2>
        <WeeklyBar heatmap={heatmap} />
      </div>
    </div>
  );
}
