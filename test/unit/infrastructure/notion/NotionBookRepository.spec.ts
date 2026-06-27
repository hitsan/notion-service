import { Client } from "@notionhq/client";
import { createNotionBookRepository } from "../../../../src/infrastructure/notion/NotionBookRepository";
import { Book } from "../../../../src/domain/entities/Book";

jest.mock("../../../../src/infrastructure/notion/uploadImageToNotion", () => ({
  uploadImageToNotion: jest.fn().mockResolvedValue("upload-id"),
}));

const createClient = () => {
  const update = jest.fn().mockResolvedValue({});
  const client = { pages: { update } } as unknown as Client;
  return { client, update };
};

const baseBook: Book = {
  kind: "Book",
  pageId: "00000000000000000000000000000000",
  name: "吾輩は猫である",
  imageUrl: "https://cover.openbd.jp/9784101010014.jpg",
};

describe("NotionBookRepository.updateBook", () => {
  it("author/publishedDate が undefined ならそのプロパティを送らない", async () => {
    const { client, update } = createClient();
    await createNotionBookRepository(client).updateBook(baseBook.pageId, baseBook);

    const props = update.mock.calls[0][0].properties;
    expect(props.Name).toBeDefined();
    expect(props.Image).toBeDefined();
    expect(props.Author).toBeUndefined();
    expect(props.PublishedDate).toBeUndefined();
  });

  it("author/publishedDate があればプロパティを送る", async () => {
    const { client, update } = createClient();
    const book: Book = {
      ...baseBook,
      author: "夏目 漱石",
      publishedDate: new Date("1905-01-01"),
    };
    await createNotionBookRepository(client).updateBook(book.pageId, book);

    const props = update.mock.calls[0][0].properties;
    expect(props.Author.rich_text[0].text.content).toBe("夏目 漱石");
    expect(props.PublishedDate.date.start).toBe("1905-01-01");
  });
});
