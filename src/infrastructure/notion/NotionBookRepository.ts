import { Client } from "@notionhq/client";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Book, BookRecord } from "../../domain/entities/Book";
import { PageId, PageIdSchema } from "../../domain/types";
import { format } from "date-fns";

export const createNotionBookRepository = (client: Client) =>
  ({
    async findBook(id: PageId): Promise<BookRecord> {
      const page = await client.pages.retrieve({ page_id: id });
      if (!("properties" in page)) throw new Error("Invalid page");

      const nameProp = page.properties["Name"];
      if (nameProp.type !== "title") throw new Error("Name property not found");
      const name = nameProp.title[0]?.plain_text ?? "";

      return { kind: "BookRecord", pageId: PageIdSchema.parse(id), name };
    },

    async updateBook(id: PageId, book: Book): Promise<void> {
      await client.pages.update({
        page_id: id,
        icon: { type: "emoji", emoji: "📕" },
        properties: {
          Name: { title: [{ text: { content: book.name } }] },
          Author: { rich_text: [{ text: { content: book.author } }] },
          PublishedDate: {
            date: { start: format(book.publishedDate, "yyyy-MM-dd"), end: null, time_zone: null },
          },
          // TODO: upload image via Notion Files API using book.imagePath
        } as any,
      });
    },
  }) satisfies IBookRepository;
