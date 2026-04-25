# M5: AI問題自動生成 — Gemini API連携 + カード一括生成UI

> 状態: ✅ 完了 (2026-04-25)
> 対象期間: 目安 1〜2週間
> 依存: M2完了 (デッキ管理が必要)

---

## 概要

Gemini 2.0 Flash APIを使ってテキストブロックから Q&A カードを自動生成する機能を実装する。
ユーザーが書籍の1節やドキュメントを貼り付けるだけで、5〜10問のカードが30秒以内に生成される。
生成されたカードは編集・削除・追加してから一括保存できる。

---

## 含む機能・タスク

### AIサービス (データ層)

- [ ] `@google/generative-ai` パッケージをインストール (`^0.x.x`)
- [ ] `src/lib/services/ai-generator.ts` を作成
  - [ ] `AIGeneratorService.generateCards(text, domain, count)` 実装
    - [ ] systemInstruction でユーザー入力とプロンプトを分離 (プロンプトインジェクション対策)
    - [ ] 入力テキストを5,000文字に切り詰め
    - [ ] レスポンスは構造化JSON (GeneratedCard[]) を要求
    - [ ] 生成カードのZod検証 (malformed JSON の場合エラーを返す)
  - [ ] TechDomain 型定義 (frontend / backend / infra / algorithm / os / network / general)
  - [ ] GeneratedCard 型定義 (front, back, cardType, suggestedTags)
- [ ] `src/lib/validations/ai.schema.ts`
  - [ ] generateCardsSchema (text: max5000, domain: TechDomain, count: 5-10)

### Gemini APIレート制限

- [ ] `src/lib/rate-limit.ts` を作成
  - [ ] ユーザー単位で1リクエスト/分の制限を実装
  - [ ] インメモリキャッシュ (Map) でレート状態を管理

### AIカード生成API

- [ ] `POST /api/ai/generate` — テキスト → カード生成
  - [ ] 認証検証
  - [ ] レート制限チェック (超過時 429 を返す)
  - [ ] `AIGeneratorService.generateCards` 呼び出し
  - [ ] 30秒タイムアウト設定 (`next.config.ts` の `maxDuration: 60` を確認)

### AIカード生成UI

- [ ] `src/components/cards/AIGeneratorForm.tsx` を作成
  - [ ] テキストエリア (max5000文字・文字数カウンター付き)
  - [ ] TechDomain セレクトボックス
  - [ ] 生成枚数スライダー (5〜10枚)
  - [ ] 「生成する」ボタン (ローディング中は進捗表示)
- [ ] `src/components/cards/GeneratedCardList.tsx` を作成
  - [ ] 生成されたカードの一覧表示 + 各カードのインライン編集
  - [ ] カードの削除ボタン
  - [ ] 「カードを追加」ボタン (空カードを追加)
  - [ ] 「すべて保存」ボタン → `POST /api/cards` を複数回呼び出し (Promise.all)
  - [ ] 保存進捗表示 (○/○ 保存完了)
- [ ] `src/app/(app)/cards/generate/page.tsx` — AI生成ページ
  - [ ] デッキ選択 (保存先)
  - [ ] AIGeneratorForm + GeneratedCardList を組み込む

### テスト

- [ ] `tests/unit/lib/services/ai-generator.test.ts`
  - [ ] Gemini APIクライアントをモックして generateCards のレスポンス処理をテスト
  - [ ] malformed JSON レスポンス時のエラーハンドリングテスト
  - [ ] テキスト5000文字超の切り詰め処理テスト

### 品質チェック

- [ ] `npm run lint` がパスする
- [ ] `npm run typecheck` がパスする
- [ ] `npm test` がパスする
- [ ] `npm run build` がパスする

---

## 受け入れ条件

- [ ] テキストを入力してドメインを選択すると5〜10枚のカードが30秒以内に生成される
- [ ] 生成されたカードを編集・削除・追加してから一括保存できる
- [ ] `GEMINI_API_KEY` なしの場合はエラーメッセージが表示される
- [ ] レート制限超過時に429エラーが返りUIに「しばらく待ってから試してください」が表示される
- [ ] `GEMINI_API_KEY` はサーバーサイドのみで使用されクライアントに露出しない

---

## KPI貢献

| KPI | 貢献内容 | 計測方法 |
|-----|---------|---------|
| カード作成数 50枚以上/月 | AI生成でカード作成の摩擦を大幅に削減 | AI生成経由のCard作成数 |
| MAU 500人 | AI生成機能が差別化要因となりユーザー獲得・口コミに貢献 | MAU推移 |

---

## 技術的前提条件・依存

| 種別 | 内容 | 備考 |
|------|------|------|
| 前提マイルストーン | M2: デッキ & カード管理 | 生成カードの保存先デッキが必要 |
| 外部サービス | Gemini API (2.0 Flash) | `GEMINI_API_KEY` が必要 |
| 環境変数 | `GEMINI_API_KEY` | Google AI Studio で取得 |

---

## 実装メモ

- Gemini API のプロンプトは `systemInstruction` でシステム部分を分離し、`contents` にユーザーテキストを渡す。1つのプロンプトに混在させない (architecture.md セキュリティ要件)
- Vercel の Serverless Functions はデフォルト10秒タイムアウト。AI生成は `next.config.ts` で `maxDuration: 60` に設定する必要がある
- インメモリのレート制限は Vercel の複数インスタンス環境では機能しない。MVP段階では許容し、スケールアウト時に Redis/Upstash に移行する
- 生成カードのZod検証は必須。LLMのレスポンスは型保証がないため、パース失敗時は適切なエラーメッセージを返す

---

## リスク

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Gemini APIのレート制限 (15RPM) 到達 | 中 | ユーザー単位の1RPM制限でAPIコストと枠を保護 |
| LLMの生成品質 (的外れな問題) | 中 | systemInstructionを丁寧に設計し、UIでユーザーが必ず編集できるフローにする |
| APIキー漏洩 | 高 | サーバーサイドのみで使用・環境変数名に `NEXT_PUBLIC_` を付けない |
