import { Book, BookRecord } from "../entities/Book";
import { PageId } from "../types";

export interface IBookRepository {
  findBook(id: PageId): Promise<BookRecord>;
  updateBook(id: PageId, book: Book): Promise<void>;
}
