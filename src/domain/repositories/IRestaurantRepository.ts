import { Restaurant, RestaurantRecord } from "../entities/Restaurant";
import { PageId } from "../types";

export interface IRestaurantRepository {
  findRestaurant(id: PageId): Promise<RestaurantRecord>;
  updateRestaurant(id: PageId, restaurant: Restaurant): Promise<void>;
}
