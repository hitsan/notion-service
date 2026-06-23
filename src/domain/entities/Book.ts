import { PageId, Path } from "../types";

export type BookRecord = {
  readonly kind: "BookRecord";
  pageId: PageId;
  name: string;
};

export type Book = {
  readonly kind: "Book";
  pageId: PageId;
  name: string;
  author: string;
  publishedDate: Date;
  imagePath: Path;
};
