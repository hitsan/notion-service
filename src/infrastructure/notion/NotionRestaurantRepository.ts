import { Client } from "@notionhq/client";
import { IRestaurantRepository } from "../../domain/repositories/IRestaurantRepository";
import { Restaurant, RestaurantRecord } from "../../domain/entities/Restaurant";
import { PageId, PageIdSchema } from "../../domain/types";

export const createNotionRestaurantRepository = (client: Client) =>
  ({
    async findRestaurant(id: PageId): Promise<RestaurantRecord> {
      const page = await client.pages.retrieve({ page_id: id });
      if (!("properties" in page)) throw new Error("Invalid page");

      const nameProp = page.properties["Name"];
      if (nameProp.type !== "title") throw new Error("Name property not found");
      const name = nameProp.title[0]?.plain_text ?? "";

      return { kind: "RestaurantRecord", pageId: PageIdSchema.parse(id), name };
    },

    async updateRestaurant(id: PageId, restaurant: Restaurant): Promise<void> {
      await client.pages.update({
        page_id: id,
        properties: {
          GoogleMap: { url: restaurant.googleMapUrl },
          URL: { url: restaurant.websiteUrl ?? null },
          // TODO: upload image via Notion Files API using restaurant.imagePath
        } as any,
      });
    },
  }) satisfies IRestaurantRepository;
