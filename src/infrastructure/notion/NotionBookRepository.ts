import { Client } from "@notionhq/client";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { Book, BookRecord } from "../../domain/entities/Book";
import { PageId } from "../../domain/types";
import { format } from "date-fns";
import { uploadImageToNotion } from "./uploadImageToNotion";

export const createNotionBookRepository = (client: Client) =>
  ({
    async findBook(id: PageId): Promise<BookRecord> {
      const page = await client.pages.retrieve({ page_id: id });
      if (!("properties" in page)) throw new Error("Invalid page");

      const nameProp = page.properties["Name"];
      if (nameProp.type !== "title") throw new Error("Name property not found");
      const name = nameProp.title[0]?.plain_text ?? "";

      return { kind: "BookRecord", pageId: id, name };
    },

    async updateBook(id: PageId, book: Book): Promise<void> {
      const filename = `${book.pageId}.jpg`;
      const fileUploadId = await uploadImageToNotion(client, book.imageUrl, filename);
      await client.pages.update({
        page_id: id,
        icon: { type: "emoji", emoji: "📕" },
        properties: {
          Name: { title: [{ text: { content: book.name } }] },
          Image: {
            files: [{ type: "file_upload", name: filename, file_upload: { id: fileUploadId } }],
          },
          ...(book.author !== undefined && {
            Author: { rich_text: [{ text: { content: book.author } }] },
          }),
          ...(book.publishedDate !== undefined && {
            PublishedDate: {
              date: { start: format(book.publishedDate, "yyyy-MM-dd"), end: null, time_zone: null },
            },
          }),
        },
      });
    },
  }) satisfies IBookRepository;
