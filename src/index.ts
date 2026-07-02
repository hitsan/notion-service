/// <reference types="@cloudflare/workers-types" />
import { Hono, type Context } from "hono";
import { Client } from "@notionhq/client";
import { createNotionBookRepository } from "./infrastructure/notion/NotionBookRepository";
import { createNotionRestaurantRepository } from "./infrastructure/notion/NotionRestaurantRepository";
import { createNotionLifelogRepository } from "./infrastructure/notion/NotionLifelogRepository";
import { createGoogleBooksApiClient } from "./infrastructure/api/GoogleBooksApiClient";
import { createGoogleMapsApiClient } from "./infrastructure/api/GoogleMapsApiClient";
import { createOpenMeteoApiClient } from "./infrastructure/api/OpenMeteoApiClient";
import { createNotionEmotionRepository } from "./infrastructure/notion/NotionEmotionRepository";
import { createUpdateBookInfo } from "./usecases/UpdateBookInfo";
import { createUpdateRestaurantInfo } from "./usecases/UpdateRestaurantInfo";
import { createAddPageToLifelog } from "./usecases/AddPageToLifelog";
import { createBackfillEmotionDates } from "./usecases/BackfillEmotionDates";
import { z } from "zod";
import { PageIdSchema, type PageId } from "./domain/types";
import { apiSecretAuth } from "./middleware/auth";
import { onError } from "./middleware/onError";

const PageRequestSchema = z.object({ pageId: PageIdSchema });

type Env = {
  NOTION_TOKEN: string;
  NOTION_LIFELOG_DB_ID: string;
  NOTION_EMOTION_DATA_SOURCE_ID: string;
  GOOGLE_MAP_APIKEY: string;
  API_SECRET: string;
};

export const app = new Hono<{ Bindings: Env }>();

app.onError(onError);

app.use("/books", apiSecretAuth);
app.use("/books/:id", apiSecretAuth);
app.use("/restaurants", apiSecretAuth);
app.use("/restaurants/:id", apiSecretAuth);

const updateBook = async (c: Context<{ Bindings: Env }>, pageId: PageId) => {
  const client = new Client({ auth: c.env.NOTION_TOKEN });
  const bookRepo = createNotionBookRepository(client);
  const updateBookInfo = createUpdateBookInfo(bookRepo, createGoogleBooksApiClient());
  await updateBookInfo.execute(pageId);
  return c.json({ ok: true });
};

const updateRestaurant = async (c: Context<{ Bindings: Env }>, pageId: PageId) => {
  const client = new Client({ auth: c.env.NOTION_TOKEN });
  const restaurantRepo = createNotionRestaurantRepository(client);
  const updateRestaurantInfo = createUpdateRestaurantInfo(
    restaurantRepo,
    createGoogleMapsApiClient(c.env.GOOGLE_MAP_APIKEY),
  );
  await updateRestaurantInfo.execute(pageId);
  return c.json({ ok: true });
};

app.post("/books/:id", (c) => updateBook(c, PageIdSchema.parse(c.req.param("id"))));
app.post("/books", async (c) =>
  updateBook(c, PageRequestSchema.parse(await c.req.json()).pageId),
);

app.post("/restaurants/:id", (c) =>
  updateRestaurant(c, PageIdSchema.parse(c.req.param("id"))),
);
app.post("/restaurants", async (c) =>
  updateRestaurant(c, PageRequestSchema.parse(await c.req.json()).pageId),
);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const client = new Client({ auth: env.NOTION_TOKEN });

    const emotionRepo = createNotionEmotionRepository(client, env.NOTION_EMOTION_DATA_SOURCE_ID);
    const backfillEmotionDates = createBackfillEmotionDates(emotionRepo);
    await backfillEmotionDates.execute();

    const lifelogRepo = createNotionLifelogRepository(client, env.NOTION_LIFELOG_DB_ID);
    const addPageToLifelog = createAddPageToLifelog(lifelogRepo, createOpenMeteoApiClient());
    await addPageToLifelog.execute();
  },
};
