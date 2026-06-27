import { PageId, Url } from "../types";

export type RestaurantRecord = {
  readonly kind: "RestaurantRecord";
  pageId: PageId;
  name: string;
};

export type Restaurant = {
  readonly kind: "Restaurant";
  pageId: PageId;
  name: string;
  googleMapUrl: Url;
  imageUrl?: Url;
  websiteUrl?: Url;
};
