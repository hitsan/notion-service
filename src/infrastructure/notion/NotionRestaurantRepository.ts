import { Client } from "@notionhq/client";
import { IRestaurantRepository } from "../../domain/repositories/IRestaurantRepository";
import { Restaurant, RestaurantRecord } from "../../domain/entities/Restaurant";
import { PageId } from "../../domain/types";
import { uploadImageToNotion } from "./uploadImageToNotion";

export const createNotionRestaurantRepository = (client: Client) =>
  ({
    async findRestaurant(id: PageId): Promise<RestaurantRecord> {
      const page = await client.pages.retrieve({ page_id: id });
      if (!("properties" in page)) throw new Error("Invalid page");

      const nameProp = page.properties["Name"];
      if (nameProp.type !== "title") throw new Error("Name property not found");
      const name = nameProp.title[0]?.plain_text ?? "";

      return { kind: "RestaurantRecord", pageId: id, name };
    },

    async updateRestaurant(id: PageId, restaurant: Restaurant): Promise<void> {
      const filename = `${restaurant.pageId}.jpg`;
      const fileUploadId = restaurant.imageUrl
        ? await uploadImageToNotion(client, restaurant.imageUrl, filename)
        : undefined;
      await client.pages.update({
        page_id: id,
        properties: {
          GoogleMap: { url: restaurant.googleMapUrl },
          URL: { url: restaurant.websiteUrl ?? null },
          ...(fileUploadId !== undefined && {
            Image: {
              files: [{ type: "file_upload", name: filename, file_upload: { id: fileUploadId } }],
            },
          }),
        },
      });
    },
  }) satisfies IRestaurantRepository;
