# M4: 学習進捗ダッシュボード — ヒートマップ + ストリーク + 統計可視化

> 状態: ✅ 完了 (2026-04-23)
> 対象期間: 目安 1週間
> 依存: M3完了 (ReviewLogデータが必要)

---

## 概要

ユーザーの学習状況を可視化し、モチベーション維持と学習継続を支援するダッシュボードを実装する。
過去30日のヒートマップ・連続学習ストリーク・習熟度分布・週次復習完了率を表示し、
「自分の努力が形になっている」感覚をユーザーに届ける。

---

## 含む機能・タスク

### 統計サービス (データ層)

- [x] `src/lib/services/stats.ts` を作成
  - [x] `getUserStats(userId)` 実装（ストリーク・習熟度分布を含む統合関数として実装）
    - [x] 総カード数・習熟度別分布 (未学習/学習中/習得済み) の集計
    - [x] 習熟度分類: repetitions=0 → 未学習, interval<21 → 学習中, interval≥21 → 習得済み（SM-2実態に合わせintervalベースに変更）
  - [x] `getHeatmapData(userId, days)` 実装
    - [x] 過去N日間の日別復習枚数を集計 (ReviewLog.reviewedAt で日別集計)
  - [x] ~~`getStreakCount(userId)` 実装~~ → `getUserStats` 内のストリーク計算に統合
  - [x] ~~`getWeeklyCompletionRate(userId, weeks)` 実装~~ → `WeeklyBar` コンポーネントがヒートマップデータから週別集計を行う設計に変更

### 統計API

- [x] `GET /api/stats` — ユーザー全体の統計情報
  - [x] UserStats (総カード数・習熟度分布・ストリーク) を返す
  - [x] ヒートマップデータ (過去30日) を含む

### ダッシュボードUI

- [x] `src/components/stats/HeatmapCalendar.tsx` — 過去30日ヒートマップ
  - [x] 日ごとの復習枚数に応じた色の濃淡 (0=gray-100 / 1-2=blue-200 / 3-5=blue-400 / 6+=blue-600)
  - [x] モバイル対応: overflow-x-auto で横スクロール
- [x] ~~`src/components/stats/StreakCounter.tsx`~~ → stats/page.tsx に直接実装 (🔥 N日連続)
- [x] `src/components/stats/MasteryDistribution.tsx` — 習熟度別カード分布 (旧 CardDistribution)
  - [x] 未学習 / 学習中 / 習得済み の件数と割合を横棒グラフで表示
- [x] `src/components/stats/WeeklyBar.tsx` — 週別復習回数バーグラフ (旧 WeeklyChart)
  - [x] シンプルな縦棒グラフ (CSS + インラインスタイル、外部ライブラリなし)
- [x] `src/app/(app)/stats/page.tsx` — 統計ページ
- [x] `src/components/layout/AppNav.tsx` に「進捗」リンクを追加

### テスト

- [x] `tests/unit/lib/services/stats.test.ts` (9テスト全通過)
  - [x] ストリーク計算の境界値テスト (連続/非連続/0日/昨日起点)
  - [x] 習熟度分類ロジックのテスト

### 品質チェック

- [x] `npm run lint` がパスする
- [x] `npm run typecheck` がパスする
- [x] `npm test` がパスする (58テスト全通過)
- [x] ~~`npm run build`~~ (CI環境での実施を想定)

---

## 受け入れ条件

- [x] 過去30日間のヒートマップカレンダーが表示される
- [x] 連続学習ストリーク日数が目立つ位置に表示される
- [x] 未学習・学習中・習得済みのカード分布が確認できる
- [x] 週別復習回数がグラフで表示される（週次完了率ではなく件数に変更）
- [x] モバイル対応: overflow-x-auto でヒートマップが横スクロール可能

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| 7日間継続率 40%以上 | ストリーク表示で「記録を途切れさせたくない」モチベーションが生まれる | 7日後のアクティブユーザー割合 |
| NPS 30以上 | 学習成果の可視化がツールの価値実感につながる | 30日後のアプリ内NPS調査 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 前提マイルストーン | M3: 復習エンジン | ReviewLogデータがないと統計が計算できない |
| 外部サービス | Supabase PostgreSQL | ReviewLog の集計クエリ |

---

## 実装メモ

- 外部グラフライブラリ(Recharts等)は導入せず、CSS + SVGで実装する (バンドルサイズ節約)
- ヒートマップはサーバーサイドで集計し、RSCとしてHTMLを返す (クライアントJSゼロ)
- ストリーク計算はサーバー時刻でタイムゾーン問題が発生しやすいため、ユーザーのタイムゾーンをセッションに保持する設計を検討
- `StatsService` は `ReviewLog(userId, reviewedAt)` インデックスを活用すること

---

## リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| タイムゾーンによるストリーク計算ズレ | 中 | まずサーバー時刻(JST固定)で実装し、多タイムゾーン対応はPost-MVPに先送り |
| 集計クエリのパフォーマンス | 低 | `ReviewLog(userId, reviewedAt)` インデックスで十分。N+1に注意し集計はPrisma集約クエリで |
