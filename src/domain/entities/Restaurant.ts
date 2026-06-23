import { PageId, Url, Path } from "../types";

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
  imagePath: Path;
  websiteUrl?: Url;
};
