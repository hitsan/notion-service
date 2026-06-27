# Plan 03: Cloudflare Workers + R2 移行

## 目的

Firebase/GCP の依存を Cloudflare Workers + R2 に置き換える。
Plan 02（Clean Architecture）完了後、infrastructure 層だけ差し替える。

---

## 移行マップ

| 現在 | 移行先 |
|------|--------|
| Cloud Functions (Pub/Sub Cron) | Cloudflare Workers Cron Triggers |
| Firebase Storage | Cloudflare R2 |
| `firebase-functions` SDK | `@cloudflare/workers-types` |
| `firebase.json` | `wrangler.toml` |
| `firebase deploy` | `wrangler deploy` |
| `functions.logger.*` | `console.log / console.error` |
| `process.env.*` | Workers `env.*` |

---

## 変更ファイル

| ファイル | 変更種別 |
|---------|---------|
| `app/functions/wrangler.toml` | 新規作成 |
| `app/functions/src/index.ts` | Workers scheduler に書き換え |
| `app/functions/src/infrastructure/storage/R2StorageRepository.ts` | 新規作成 |
| `app/functions/src/infrastructure/storage/FirebaseStorageRepository.ts` | 削除 |
| `app/functions/package.json` | Firebase SDK 削除、workers-types 追加 |
| `.github/workflows/deploy.yml` | wrangler deploy に書き換え |
| `app/firebase.json` | 削除 |
| `scripts/migrate-storage-to-r2.ts` | 新規作成（一度だけ手動実行） |

---

## 実装内容

### `wrangler.toml`

```toml
name = "notion-service"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "notion-service-images"

[triggers]
crons = ["0 21 * * *"]  # UTC 21:00 = JST 06:00
```

### `index.ts` の変更

```typescript
// Before
import * as functions from "firebase-functions";
exports.scheduledFunctionCrontab = functions.pubsub.schedule(...).onRun(async () => { ... });

// After
export interface Env {
  R2_BUCKET: R2Bucket;
  NOTION_TOKEN: string;
  NOTION_LIFELOG_DATABASE_ID: string;
  NOTION_WATCHLIST_DATABASE_ID: string;
  NOTION_RESTRAUNT_DATABSE_ID: string;
  GOOGLE_MAP_TIMELINE_URL: string;
  GOOGLE_MAP_APIKEY: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    // 依存注入して usecase を呼ぶ
  }
};
```

`functions.logger.*` → `console.log / console.error` に全置換。

### `R2StorageRepository.ts`（`IStorageRepository` 実装）

```typescript
export class R2StorageRepository implements IStorageRepository {
  constructor(private readonly bucket: R2Bucket, private readonly publicDomain: string) {}

  async upload(key: string, data: ArrayBuffer): Promise<string> {
    await this.bucket.put(key, data);
    return `${this.publicDomain}/${key}`;
  }
}
```

### Firebase Storage → R2 移行スクリプト（`scripts/migrate-storage-to-r2.ts`）

- Firebase Admin SDK でバケット内ファイル一覧を取得
- `@aws-sdk/client-s3` で R2 の S3 互換エンドポイントへアップロード
- 実行: `npx ts-node scripts/migrate-storage-to-r2.ts`（一度だけ手動実行）
- 完了後にスクリプトを削除し、`FirebaseStorageRepository` も削除

### `package.json` の依存更新

削除:
- `firebase`, `firebase-admin`, `firebase-functions`
- devDep: `firebase-functions-test`

追加:
- devDep: `@cloudflare/workers-types`, `wrangler`

scripts 更新:
- `"deploy": "wrangler deploy"`
- `"dev": "wrangler dev"`
- 削除: `serve`, `shell`, `start`, `logs`

### `.github/workflows/deploy.yml`

```yaml
- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    workingDirectory: ./app/functions
```

**GitHub Secrets の変更**
- 削除: `GCP_SA_KEY`, `FIRESTORAGE_BUCKET`
- 追加: `CLOUDFLARE_API_TOKEN`

環境変数（Secrets）は `wrangler secret put` でデプロイ前に登録する:
- `NOTION_TOKEN`
- `NOTION_LIFELOG_DATABASE_ID`
- `NOTION_WATCHLIST_DATABASE_ID`
- `NOTION_RESTRAUNT_DATABSE_ID`
- `GOOGLE_MAP_TIMELINE_URL`
- `GOOGLE_MAP_APIKEY`

---

## 前提条件

- Cloudflare アカウントで R2 が有効化されていること
- `notion-service-images` バケットを事前に作成していること
- R2 パブリックドメインが設定されていること

---

## 検証

```sh
# ローカル動作確認
wrangler dev

# R2 の画像確認
wrangler r2 object list notion-service-images

# デプロイ確認（GitHub Actions の workflow_dispatch）
# Cloudflare ダッシュボードで Cron Triggers の実行ログを確認
```
