import { prisma } from '@/lib/prisma';

export interface UserStats {
  totalCards: number;
  totalReviews: number;
  streak: number;
  masteryDistribution: {
    unlearned: number;
    learning: number;
    mastered: number;
  };
}

export interface HeatmapEntry {
  date: string;  // 'YYYY-MM-DD'
  count: number;
}

/** アプリのタイムゾーン (JST 固定) */
const APP_TZ = 'Asia/Tokyo';

/** ストリーク計算に使う最大遡及日数（パフォーマンス上限） */
const STREAK_LOOKBACK_DAYS = 366;

/**
 * ユーザーの学習統計を集計する。
 *
 * @param userId - 統計を取得するユーザーID
 * @returns 総カード数・総復習回数・連続学習日数・習熟度分布
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // ストリーク計算に必要な期間のみ取得（全件フェッチを防ぐパフォーマンス上限）
  const streakSince = new Date();
  streakSince.setDate(streakSince.getDate() - STREAK_LOOKBACK_DAYS);

  const [totalCards, totalReviews, cards, reviewLogs] = await Promise.all([
    prisma.card.count({ where: { userId } }),
    prisma.reviewLog.count({ where: { userId } }),
    prisma.card.findMany({
      where: { userId },
      select: { repetitions: true, interval: true },
    }),
    prisma.reviewLog.findMany({
      where: { userId, reviewedAt: { gte: streakSince } },
      select: { reviewedAt: true },
      orderBy: { reviewedAt: 'desc' },
    }),
  ]);

  const masteryDistribution = {
    unlearned: cards.filter((c) => c.repetitions === 0).length,
    learning: cards.filter((c) => c.repetitions > 0 && c.interval < 21).length,
    mastered: cards.filter((c) => c.interval >= 21).length,
  };

  // ストリーク計算: 今日または昨日を起点に連続してレビューがある日数を数える
  const reviewDates = new Set(
    reviewLogs.map((log) => toDateString(log.reviewedAt)),
  );
  const streak = calculateStreak(reviewDates);

  return { totalCards, totalReviews, streak, masteryDistribution };
}

/**
 * 直近 days 日間の日別復習回数を返す。
 * レビューがない日も count: 0 のエントリーとして含める。
 *
 * @param userId - ユーザーID
 * @param days - 遡る日数（今日を含む）
 * @returns 日付昇順の HeatmapEntry 配列
 */
export async function getHeatmapData(userId: string, days: number): Promise<HeatmapEntry[]> {
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error('days must be a positive integer');
  }

  // JST の今日の開始時刻（00:00:00+09:00）を UTC 表現で取得
  const todayJSTStr = toDateString(new Date());
  const todayJST = new Date(`${todayJSTStr}T00:00:00+09:00`);

  // days 日前の JST 00:00:00 を UTC 基準で算出
  const since = new Date(todayJST);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const reviewLogs = await prisma.reviewLog.findMany({
    where: {
      userId,
      reviewedAt: { gte: since },
    },
    select: { reviewedAt: true },
  });

  // 日付ごとにカウントを集計
  const countByDate = new Map<string, number>();
  for (const log of reviewLogs) {
    const dateStr = toDateString(log.reviewedAt);
    countByDate.set(dateStr, (countByDate.get(dateStr) ?? 0) + 1);
  }

  // days 日分のスロットを生成（count: 0 で初期化）
  const result: HeatmapEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const slotDate = new Date(todayJST);
    slotDate.setUTCDate(slotDate.getUTCDate() - i);
    const dateStr = toDateString(slotDate);
    result.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 });
  }

  return result;
}

/**
 * Date を JST の 'YYYY-MM-DD' 文字列に変換する。
 * サーバーが UTC 環境でも JST 日付を正確に返す。
 */
function toDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

/**
 * レビューがあった日付セットから連続学習日数を計算する。
 * 今日または昨日（まだ今日レビューしていない場合）を起点とする。
 */
function calculateStreak(reviewDates: Set<string>): number {
  // JST の今日の開始時刻（00:00:00+09:00）を UTC 表現で取得
  const todayStr = toDateString(new Date());
  const todayJST = new Date(`${todayStr}T00:00:00+09:00`);

  const yesterday = new Date(todayJST);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  // 今日レビューがある → 今日から遡る
  // 今日はなく昨日はある → 昨日から遡る（当日未レビューの救済）
  // どちらもない → streak = 0
  let startOffset = 0;
  if (reviewDates.has(todayStr)) {
    startOffset = 0;
  } else if (reviewDates.has(yesterdayStr)) {
    startOffset = 1;
  } else {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(todayJST);
  cursor.setUTCDate(cursor.getUTCDate() - startOffset);

  while (reviewDates.has(toDateString(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
