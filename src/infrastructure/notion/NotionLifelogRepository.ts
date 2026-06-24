import { Client } from "@notionhq/client";
import { ILifelogRepository } from "../../domain/repositories/ILifelogRepository";
import { Lifelog } from "../../domain/entities/Lifelog";
import { formatInTimeZone } from "date-fns-tz";

const TIME_ZONE = "Asia/Tokyo";

export const createNotionLifelogRepository = (client: Client, dbId: string) =>
  ({
    async createLifelog(lifelog: Lifelog): Promise<void> {
      const date = formatInTimeZone(lifelog.date, TIME_ZONE, "yyyy-MM-dd");
      await client.pages.create({
        parent: { database_id: dbId },
        icon: { type: "emoji", emoji: "🗓️" },
        properties: {
          Logs: { title: [{ text: { content: date.replaceAll("-", "/") } }] },
          Date: { date: { start: date, end: null, time_zone: null } },
          Weather: { rich_text: [{ text: { content: lifelog.weatherInfo } }] },
        } as any,
      });
    },
  }) satisfies ILifelogRepository;
