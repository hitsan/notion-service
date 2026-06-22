# Plan 02: Cloudflare Workers + Hono + Clean Architecture 移行

## 目的

Firebase Cloud Functions を廃止し、Cloudflare Workers + Hono + Clean Architecture に移行する。

- **Book / Restaurant**: `POST /books/:id`, `POST /restaurants/:id` で個別更新
- **Lifelog**: cron trigger（scheduled）のまま
- 画像は Notion Files API で Notion に直接アップロード（Firebase Storage 廃止）
- HTTP クライアントは native fetch（axios 廃止）
- `app/` ディレクトリを廃止し、ルートに新構造を作る

---

## 最終的なディレクトリ構成

```
notion-service/
  src/
    domain/
      entities/
        Restaurant.ts       ← imagePath: string を含む
        Book.ts             ← imagePath: string を含む
        Lifelog.ts
      repositories/
        IBookRepository.ts
        IRestaurantRepository.ts
        ILifelogRepository.ts
    usecases/
      UpdateBookInfo.ts        ← execute(pageId: string)
      UpdateRestaurantInfo.ts  ← execute(pageId: string)
      AddPageToLifelog.ts      ← execute()
    infrastructure/
      notion/
        NotionBookRepository.ts
        NotionRestaurantRepository.ts  ← 画像を Notion Files API でアップロード
        NotionLifelogRepository.ts
      api/
        GoogleMapsApiClient.ts
        GoogleBooksApiClient.ts
        OpenMeteoApiClient.ts
    index.ts   ← Hono + scheduled handler
  test/
    unit/
      infrastructure/notion/
      usecases/
  wrangler.toml
  package.json
  tsconfig.json
  flake.nix
  .envrc
```

---

## 設計の要点

### エントリーポイント（index.ts）

```typescript
const app = new Hono<{ Bindings: Env }>()

app.post('/books/:id', async (c) => {
  const bookRepo = new NotionBookRepository(c.env.NOTION_TOKEN, c.env.WATCHLIST_DB_ID)
  await new UpdateBookInfo(bookRepo, new GoogleBooksApiClient()).execute(c.req.param('id'))
  return c.json({ ok: true })
})

app.post('/restaurants/:id', async (c) => {
  const restaurantRepo = new NotionRestaurantRepository(c.env.NOTION_TOKEN, c.env.RESTAURANT_DB_ID)
  await new UpdateRestaurantInfo(restaurantRepo, new GoogleMapsApiClient(c.env.GOOGLE_MAP_APIKEY)).execute(c.req.param('id'))
  return c.json({ ok: true })
})

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const lifelogRepo = new NotionLifelogRepository(env.NOTION_TOKEN, env.LIFELOG_DB_ID)
    await new AddPageToLifelog(lifelogRepo, new OpenMeteoApiClient()).execute()
  },
}
```

### リポジトリ interface（Notion 非依存）

```typescript
// IBookRepository.ts
interface IBookRepository {
  findBook(id: string): Promise<Book>;
  updateBook(id: string, book: Book): Promise<void>;
}

// IRestaurantRepository.ts
interface IRestaurantRepository {
  findRestaurant(id: string): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: Restaurant): Promise<void>;
}

// ILifelogRepository.ts
interface ILifelogRepository {
  createLifelog(lifelog: Lifelog): Promise<void>;
}
```

---

## 実装手順（TDD サイクル）

1. **ルートにプロジェクト初期化** — `package.json`（hono, wrangler, @cloudflare/workers-types）, `tsconfig.json`, `wrangler.toml`
2. **domain/entities/** — 既存 `app/` から型を抽出。`ImageUrl` は廃止し `imagePath: string` に
3. **domain/repositories/** — interface を定義（Notion 非依存のドメイン語）
4. **infrastructure/notion/** — 各 `Notion*Repository` を実装。テストを `test/unit/infrastructure/notion/` に作成
5. **infrastructure/api/** — `axios` → `fetch` で各 API クライアントを移植
6. **usecases/** — constructor injection で repository を受け取る。repository mock でテスト
7. **index.ts** — Hono + scheduled として実装
8. **app/ を削除**

---

## 検証

```sh
npm test             # 全件グリーン
npx wrangler dev     # ローカル動作確認
```
