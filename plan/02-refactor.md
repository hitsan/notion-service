# Plan 02: Clean Architecture リファクタリング

## 目的

現在のフラットな構造を Clean Architecture に再編する。
依存の方向: `index → usecases → domain ← infrastructure`

---

## 現在の構造

```
app/functions/src/
  index.ts
  service/
    lifelog.ts
    watchList/
      watchList.ts
      book-info.ts
    restraunt/
      restraunt.ts
      utils/imageUrl.ts
  helper/
    notion-client-helper.ts
    notion-data-helper.ts
    types.ts
```

---

## 移行後の構造

```
app/functions/src/
  domain/
    entities/
      ImageUrl.ts          ← utils/imageUrl.ts から移動
      Restaurant.ts        ← RestrauntPageData 等の型定義
      Book.ts              ← 書籍エンティティ
      Lifelog.ts           ← ライフログエンティティ
    repositories/
      INotionRepository.ts ← NotionClientHelper の interface を抽出
      IStorageRepository.ts
  usecases/
    AddPageToLifelog.ts    ← service/lifelog.ts のロジックを移植
    UpdateRestaurantInfo.ts ← service/restraunt/restraunt.ts のロジックを移植
    UpdateBooksInfo.ts     ← service/watchList/book-info.ts のロジックを移植
  infrastructure/
    notion/
      NotionRepository.ts  ← notion-client-helper.ts + notion-data-helper.ts を実装
    storage/
      FirebaseStorageRepository.ts  ← uploadImage を移植
    api/
      GoogleMapsApiClient.ts        ← featchRestrauntInfo を移植
      GoogleBooksApiClient.ts       ← 書籍情報取得を移植
      OpenMeteoApiClient.ts         ← 天気情報取得を移植
  index.ts                 ← 依存注入 + エントリーポイント（Firebase Cron のまま）
```

---

## 各レイヤーの責務

| レイヤー | 内容 | 外部依存 |
|---------|------|---------|
| `domain/entities/` | 値オブジェクト・型定義 | なし |
| `domain/repositories/` | インフラ層への interface | なし |
| `usecases/` | ビジネスロジック | domain のみ |
| `infrastructure/` | 外部 API・SDK の具体実装 | 何でも可 |
| `index.ts` | 依存注入・エントリーポイント | 全レイヤー |

---

## 移行手順（TDD サイクルで進める）

1. `domain/entities/` にエンティティを抽出（型の移動のみ）
2. `domain/repositories/` に interface を定義
3. `infrastructure/` に具体実装を移植（テストが通ることを確認）
4. `usecases/` にロジックを移植（repository mock でテスト）
5. `index.ts` を依存注入のみに簡略化
6. `service/` と `helper/` を削除

---

## テスト再編

| 移行前 | 移行後 |
|-------|-------|
| `test/unit/helper/` | `test/unit/infrastructure/notion/` |
| `test/unit/service/` | `test/unit/usecases/` |

usecase のテストは `INotionRepository` / `IStorageRepository` の mock を注入してテストする。

---

## 検証

リファクタリング前後で `npm test` が全件グリーンであること。
