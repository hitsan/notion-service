import { Restaurant } from "../entities/Restaurant";
import { PageId } from "../types";

export interface IRestaurantRepository {
  findRestaurant(id: PageId): Promise<Restaurant>;
  updateRestaurant(id: PageId, restaurant: Restaurant): Promise<void>;
}
