import { PageId, Path } from "../types";

export type Book = {
  pageId: PageId;
  name: string;
  author: string;
  publishedDate: Date;
  imagePath: Path;
};
