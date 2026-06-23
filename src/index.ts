/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { Client } from "@notionhq/client";
import { createNotionBookRepository } from "./infrastructure/notion/NotionBookRepository";
import { createNotionRestaurantRepository } from "./infrastructure/notion/NotionRestaurantRepository";
import { createNotionLifelogRepository } from "./infrastructure/notion/NotionLifelogRepository";
import { createGoogleBooksApiClient } from "./infrastructure/api/GoogleBooksApiClient";
import { createGoogleMapsApiClient } from "./infrastructure/api/GoogleMapsApiClient";
import { createOpenMeteoApiClient } from "./infrastructure/api/OpenMeteoApiClient";
import { createUpdateBookInfo } from "./usecases/UpdateBookInfo";
import { createUpdateRestaurantInfo } from "./usecases/UpdateRestaurantInfo";
import { createAddPageToLifelog } from "./usecases/AddPageToLifelog";
import { PageIdSchema } from "./domain/types";

type Env = {
  NOTION_TOKEN: string;
  NOTION_WATCHLIST_DB_ID: string;
  NOTION_RESTAURANT_DB_ID: string;
  NOTION_LIFELOG_DB_ID: string;
  GOOGLE_MAP_APIKEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post("/books/:id", async (c) => {
  const pageId = PageIdSchema.parse(c.req.param("id"));
  const client = new Client({ auth: c.env.NOTION_TOKEN });
  const bookRepo = createNotionBookRepository(client);
  const updateBookInfo = createUpdateBookInfo(bookRepo, createGoogleBooksApiClient());
  await updateBookInfo.execute(pageId);
  return c.json({ ok: true });
});

app.post("/restaurants/:id", async (c) => {
  const pageId = PageIdSchema.parse(c.req.param("id"));
  const client = new Client({ auth: c.env.NOTION_TOKEN });
  const restaurantRepo = createNotionRestaurantRepository(client);
  const updateRestaurantInfo = createUpdateRestaurantInfo(
    restaurantRepo,
    createGoogleMapsApiClient(c.env.GOOGLE_MAP_APIKEY),
  );
  await updateRestaurantInfo.execute(pageId);
  return c.json({ ok: true });
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const client = new Client({ auth: env.NOTION_TOKEN });
    const lifelogRepo = createNotionLifelogRepository(client, env.NOTION_LIFELOG_DB_ID);
    const addPageToLifelog = createAddPageToLifelog(lifelogRepo, createOpenMeteoApiClient());
    await addPageToLifelog.execute();
  },
};
