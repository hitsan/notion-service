import { Client } from "@notionhq/client";
import { createNotionLifelogRepository } from "../../../../src/infrastructure/notion/NotionLifelogRepository";

const create = jest.fn().mockResolvedValue({});
const client = { pages: { create } } as unknown as Client;

describe("NotionLifelogRepository", () => {
  it("JST の日付で Notion ページを作成する（UTC 夜は JST 翌日）", async () => {
    const repo = createNotionLifelogRepository(client, "db-id");
    // 2026-06-25T21:30Z は JST 2026-06-26
    await repo.createLifelog({
      date: new Date("2026-06-25T21:30:00Z"),
      weatherInfo: "☀️25",
    });

    const arg = create.mock.calls[0][0] as any;
    expect(arg.properties.Date.date.start).toBe("2026-06-26");
    expect(arg.properties.Logs.title[0].text.content).toBe("2026/06/26");
  });
});
