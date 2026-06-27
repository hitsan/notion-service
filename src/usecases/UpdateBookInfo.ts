import { IBookRepository } from "../domain/repositories/IBookRepository";
import { GoogleBooksApiClient } from "../infrastructure/api/GoogleBooksApiClient";
import { Book } from "../domain/entities/Book";
import { PageId } from "../domain/types";

export const createUpdateBookInfo = (
  bookRepo: IBookRepository,
  booksApiClient: GoogleBooksApiClient,
) => ({
  execute: async (pageId: PageId): Promise<void> => {
    const record = await bookRepo.findBook(pageId);
    const result = await booksApiClient.search(record.name);
    const book: Book = {
      kind: "Book",
      pageId: record.pageId,
      name: result.title,
      author: result.author,
      publishedDate: result.publishedDate,
      imageUrl: result.coverImageUrl,
    };
    await bookRepo.updateBook(pageId, book);
  },
});
