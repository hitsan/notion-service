import { PageId, Url, Path } from "../types";

export type Restaurant = {
  pageId: PageId;
  name: string;
  googleMapUrl: Url;
  imagePath: Path;
  websiteUrl?: Url;
};
