import { Client } from "@notionhq/client";
import { IEmotionRepository } from "../../domain/repositories/IEmotionRepository";
import { EmotionToBackfill } from "../../domain/entities/Emotion";
import { PageId } from "../../domain/types";

const toPageId = (id: string): PageId => id.replaceAll("-", "") as PageId;

export const createNotionEmotionRepository = (client: Client, dataSourceId: string) =>
  ({
    async findEmotionsWithoutDate(): Promise<EmotionToBackfill[]> {
      const targets: EmotionToBackfill[] = [];
      let cursor: string | undefined = undefined;
      do {
        const res = await client.dataSources.query({
          data_source_id: dataSourceId,
          filter: {
            and: [
              { property: "LifeLog", relation: { is_not_empty: true } },
              { property: "Date", date: { is_empty: true } },
            ],
          },
          start_cursor: cursor,
        });
        for (const page of res.results) {
          if (!("properties" in page)) continue;
          const lifelogProp = page.properties["LifeLog"];
          if (lifelogProp.type !== "relation" || !Array.isArray(lifelogProp.relation)) continue;
          const relation = lifelogProp.relation;
          if (relation.length === 0) continue;
          targets.push({
            pageId: toPageId(page.id),
            lifelogPageId: toPageId(relation[0].id),
          });
        }
        cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
      } while (cursor);
      return targets;
    },

    async findLifelogDate(lifelogPageId: PageId): Promise<string | undefined> {
      const page = await client.pages.retrieve({ page_id: lifelogPageId });
      if (!("properties" in page)) return undefined;
      const dateProp = page.properties["Date"];
      if (dateProp.type !== "date" || dateProp.date === null) return undefined;
      return dateProp.date.start;
    },

    async updateDate(pageId: PageId, date: string): Promise<void> {
      await client.pages.update({
        page_id: pageId,
        properties: {
          Date: { date: { start: date, end: null, time_zone: null } },
        },
      });
    },
  }) satisfies IEmotionRepository;
