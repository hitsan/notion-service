import { Client } from "@notionhq/client";
import { IRestaurantRepository } from "../../domain/repositories/IRestaurantRepository";
import { Restaurant, RestaurantRecord } from "../../domain/entities/Restaurant";
import { PageId, PageIdSchema } from "../../domain/types";
import { uploadImageToNotion } from "./uploadImageToNotion";

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
      const filename = `${restaurant.pageId}.jpg`;
      const fileUploadId = await uploadImageToNotion(client, restaurant.imageUrl, filename);
      await client.pages.update({
        page_id: id,
        properties: {
          GoogleMap: { url: restaurant.googleMapUrl },
          URL: { url: restaurant.websiteUrl ?? null },
          Image: {
            files: [{ type: "file_upload", name: filename, file_upload: { id: fileUploadId } }],
          },
        } as any,
      });
    },
  }) satisfies IRestaurantRepository;
