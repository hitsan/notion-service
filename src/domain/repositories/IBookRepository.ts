import { Book } from "../entities/Book";
import { PageId } from "../types";

export interface IBookRepository {
  findBook(id: PageId): Promise<Book>;
  updateBook(id: PageId, book: Book): Promise<void>;
}
