import {updateBooksInfo} from "../../src/book-info";
// import {mockedData} from "./book-info-test-data"
import {Client} from "@notionhq/client";

describe("Update Book Info Test", () => {
  const notionToken = process.env.NOTION_TOKEN || "";
  const notion = new Client({auth: notionToken});
//   jest.mock("notion");

  const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";

  test("Get weather info", async () => {
    // (notion.databases.query as jest.MockedFunction<typeof notion.databases.query>).mockResolvedValueOnce(mockedData);
    const result = await updateBooksInfo(notion, watchListDBId);
    expect(result).toBeTruthy();
  });
});