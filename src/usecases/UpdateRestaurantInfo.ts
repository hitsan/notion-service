import { IRestaurantRepository } from "../domain/repositories/IRestaurantRepository";
import { GoogleMapsApiClient } from "../infrastructure/api/GoogleMapsApiClient";
import { Restaurant } from "../domain/entities/Restaurant";
import { PageId } from "../domain/types";

export const createUpdateRestaurantInfo = (
  restaurantRepo: IRestaurantRepository,
  mapsApiClient: GoogleMapsApiClient,
) => ({
  execute: async (pageId: PageId): Promise<void> => {
    const record = await restaurantRepo.findRestaurant(pageId);
    const result = await mapsApiClient.search(record.name);
    const restaurant: Restaurant = {
      kind: "Restaurant",
      pageId: record.pageId,
      name: record.name,
      googleMapUrl: result.googleMapUrl,
      imageUrl: result.imageRefUrl,
      websiteUrl: result.websiteUrl,
    };
    await restaurantRepo.updateRestaurant(pageId, restaurant);
  },
});
