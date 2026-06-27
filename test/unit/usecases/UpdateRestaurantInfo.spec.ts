import { createUpdateRestaurantInfo } from "../../../src/usecases/UpdateRestaurantInfo";
import { IRestaurantRepository } from "../../../src/domain/repositories/IRestaurantRepository";
import { GoogleMapsApiClient } from "../../../src/infrastructure/api/GoogleMapsApiClient";
import { RestaurantRecord } from "../../../src/domain/entities/Restaurant";

const pageId = "b".repeat(32) as any;

const mockRecord: RestaurantRecord = {
  kind: "RestaurantRecord",
  pageId,
  name: "俺のフレンチ",
};

const mockRestaurantRepo: IRestaurantRepository = {
  findRestaurant: jest.fn().mockResolvedValue(mockRecord),
  updateRestaurant: jest.fn().mockResolvedValue(undefined),
};

const mockMapsApiClient: GoogleMapsApiClient = {
  search: jest.fn().mockResolvedValue({
    googleMapUrl: "https://maps.google.com/?cid=123",
    imageRefUrl: "https://maps.googleapis.com/maps/api/place/photo?ref=abc",
    websiteUrl: "https://example.com",
  }),
};

describe("UpdateRestaurantInfo", () => {
  it("レストラン情報を取得して Notion を更新する", async () => {
    const usecase = createUpdateRestaurantInfo(mockRestaurantRepo, mockMapsApiClient);
    await usecase.execute(pageId);

    expect(mockRestaurantRepo.findRestaurant).toHaveBeenCalledWith(pageId);
    expect(mockMapsApiClient.search).toHaveBeenCalledWith("俺のフレンチ");
    expect(mockRestaurantRepo.updateRestaurant).toHaveBeenCalledWith(
      pageId,
      expect.objectContaining({
        kind: "Restaurant",
        name: "俺のフレンチ",
        googleMapUrl: "https://maps.google.com/?cid=123",
      }),
    );
  });
});
