import { Client } from "@notionhq/client";
import { createNotionRestaurantRepository } from "../../../../src/infrastructure/notion/NotionRestaurantRepository";
import { Restaurant } from "../../../../src/domain/entities/Restaurant";
import { uploadImageToNotion } from "../../../../src/infrastructure/notion/uploadImageToNotion";

jest.mock("../../../../src/infrastructure/notion/uploadImageToNotion", () => ({
  uploadImageToNotion: jest.fn().mockResolvedValue("upload-id"),
}));

const createClient = () => {
  const update = jest.fn().mockResolvedValue({});
  const client = { pages: { update } } as unknown as Client;
  return { client, update };
};

const baseRestaurant: Restaurant = {
  kind: "Restaurant",
  pageId: "00000000000000000000000000000000",
  name: "俺のフレンチ",
  googleMapUrl: "https://maps.google.com/?cid=123",
};

describe("NotionRestaurantRepository.updateRestaurant", () => {
  afterEach(() => jest.clearAllMocks());

  it("imageUrl が undefined なら画像をアップロードせず Image を送らない", async () => {
    const { client, update } = createClient();
    await createNotionRestaurantRepository(client).updateRestaurant(
      baseRestaurant.pageId,
      baseRestaurant,
    );

    expect(uploadImageToNotion).not.toHaveBeenCalled();
    const props = update.mock.calls[0][0].properties;
    expect(props.GoogleMap).toBeDefined();
    expect(props.Image).toBeUndefined();
  });

  it("imageUrl があれば Image を送る", async () => {
    const { client, update } = createClient();
    const restaurant: Restaurant = {
      ...baseRestaurant,
      imageUrl: "https://maps.googleapis.com/photo",
    };
    await createNotionRestaurantRepository(client).updateRestaurant(
      restaurant.pageId,
      restaurant,
    );

    expect(uploadImageToNotion).toHaveBeenCalledTimes(1);
    const props = update.mock.calls[0][0].properties;
    expect(props.Image.files[0].file_upload.id).toBe("upload-id");
  });
});
