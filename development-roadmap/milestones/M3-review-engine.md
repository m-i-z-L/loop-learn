# M3: 復習エンジン — SM-2フル実装 + 復習セッションUI

> 状態: ⬜ 未着手
> 対象期間: 目安 1〜2週間
> 依存: M2完了 (デッキ・カードデータが必要)

---

## 概要

SM-2アルゴリズムの完全実装と、カードをフリップして自己評価する復習セッションUIを実装する。
今日の復習カードを自動スケジューリングし、ユーザーが隙間時間に効率よく復習できる体験を提供する。
このマイルストーンの完了でloop-learnのコア価値（間隔反復による記憶定着）が動作するようになる。

---

## 含む機能・タスク

### SM-2サービス (データ層)

- [ ] `src/lib/services/sm2.ts` を作成
  - [ ] `SM2Service.calculate(card, rating)` 実装
    - [ ] Rating 1 (全然わからない): repetitions=0, interval=1, easeFactor-=0.20 (min 1.3)
    - [ ] Rating 2 (うっすら): repetitions=max(0,rep-1), interval=max(1,interval*0.5), easeFactor-=0.15
    - [ ] Rating 3 (わかった): repetitions+1, interval計算 (rep=1→1, rep=2→6, rep>2→interval*easeFactor)
    - [ ] Rating 4 (完璧): Rating3と同計算, easeFactor+=0.10 (max 2.5基準なし・上限なし)
    - [ ] nextReviewDate = today + interval日 (時刻は00:00:00に正規化)
  - [ ] SM2Result 型定義 (newInterval, newEaseFactor, newRepetitions, nextReviewDate)
- [ ] `src/lib/validations/review.schema.ts`
  - [ ] submitReviewSchema (cardId: cuid, rating: 1|2|3|4)

### 復習サービス (データ層)

- [ ] `src/lib/services/review.ts` を作成
  - [ ] `getTodayReviewCards(userId, deckId?)` — `nextReviewDate <= today` のカードを取得
    - [ ] 期限切れ (nextReviewDate < today) を優先表示するソート
  - [ ] `submitReview(cardId, userId, rating)` 実装
    - [ ] SM2Service.calculate を呼び出し
    - [ ] Card の SM-2パラメータを更新 (easeFactor / interval / repetitions / nextReviewDate)
    - [ ] ReviewLog を作成 (previousInterval / newInterval / rating / reviewedAt)
    - [ ] トランザクション処理 (Card更新とReviewLog作成をアトミックに)
  - [ ] `getSessionSummary(userId, sessionDate)` — セッション終了サマリー用統計

### 復習API (APIレイヤー)

- [ ] `GET /api/review/today` — 今日の復習カード一覧 (deckIdクエリパラメータ対応)
- [ ] `POST /api/review/[cardId]` — 自己評価送信 → SM-2計算 → Card + ReviewLog更新

### 復習セッションUI

- [ ] `src/components/review/ReviewCard.tsx` — カードフリップUI
  - [ ] 問題面表示 → タップで答え面表示 (CSS transform でフリップアニメーション)
  - [ ] cloze / code / freewrite タイプごとの表示切り替え
  - [ ] Markdownレンダリング (CardPreview 再利用)
- [ ] `src/components/review/RatingButtons.tsx` — 4段階自己評価ボタン
  - [ ] 1: 全然わからない / 2: うっすら / 3: わかった / 4: 完璧
  - [ ] 答え面確認後にのみ表示
- [ ] `src/components/review/SessionProgress.tsx` — セッション進捗表示
  - [ ] 残り枚数・完了枚数・プログレスバー
- [ ] `src/app/(app)/review/page.tsx` — 復習セッションページ
  - [ ] セッション開始から最初のカード表示まで2秒以内
  - [ ] セッション中断・再開の対応
  - [ ] 全カード完了でサマリーページへ遷移
- [ ] `src/app/(app)/review/summary/page.tsx` — セッション終了サマリー
  - [ ] 復習枚数・平均評価・連続学習日数 (ストリーク) 表示
  - [ ] 「今日もお疲れ様」的なモチベーション表示

### ダッシュボード更新 (今日の復習カード表示)

- [ ] `src/app/(app)/dashboard/page.tsx` に今日の復習カード一覧を表示
  - [ ] 復習予定枚数のバッジ表示
  - [ ] デッキ別の復習予定枚数内訳
  - [ ] 「今すぐ復習する」ボタン → `/review` へ遷移

### テスト

- [ ] `tests/unit/lib/services/sm2.test.ts`
  - [ ] Rating 1〜4 の各計算結果の正確性 (100%カバレッジ)
  - [ ] easeFactor の下限 (1.3) ・上限制約のテスト
  - [ ] nextReviewDate の日付計算精度テスト
- [ ] `tests/unit/lib/services/review.test.ts`
  - [ ] submitReview のCard更新・ReviewLog作成のテスト (Prismaモック)

### 品質チェック

- [ ] `npm run lint` がパスする
- [ ] `npm run typecheck` がパスする
- [ ] `npm test` がパスする (SM-2テスト 100%カバレッジ)
- [ ] `npm run build` がパスする

---

## 受け入れ条件

- [ ] 今日の復習予定カードがダッシュボードに表示される
- [ ] 復習セッションで問題面→答え面のフリップができる
- [ ] 4段階の自己評価を送信すると SM-2 で次回復習日が更新される
- [ ] セッション終了時に復習枚数・平均評価が表示される
- [ ] SM-2 テストが 100% カバレッジでパスする
- [ ] 期限切れカードが優先表示される

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| 7日間継続率 40%以上 | 毎日の復習スケジュールが自動生成され継続動機が生まれる | 7日後のアクティブユーザー割合 |
| 平均セッション数 週4回以上 | 今日の復習カードが常に表示されることで訪問動機が生まれる | WeeklyActiveUsers / UniqueUsers |
| 復習完了率 70%以上 | SM-2による正確なスケジューリングで無理のない復習量を維持 | ReviewLog件数 / スケジュール件数 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 前提マイルストーン | M2: デッキ & カード管理 | 復習するカードデータが必要 |
| 外部サービス | Supabase PostgreSQL | ReviewLog テーブルへの書き込み |

---

## 実装メモ

- SM-2 の `nextReviewDate` は時刻を `00:00:00` に正規化してから保存 (タイムゾーン問題を避けるため)
- ReviewLog 作成と Card 更新は Prisma の `$transaction` でアトミックに処理すること
- カードフリップアニメーションは `transform: rotateY(180deg)` + `backface-visibility: hidden` のCSS実装。JSでレイアウトを操作しない (architecture.md の16ms要件)
- セッション中断状態はローカルステート (sessionStorage) で管理。永続化不要

---

## リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| SM-2計算の境界値バグ | 高 | 全Rating・全パラメータ組み合わせのユニットテストを必須化 |
| セッション中のネットワーク切断 | 中 | submitReview が失敗した場合はリトライUIを表示。ReviewLogが重複しないよう冪等性を確認 |
