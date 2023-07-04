import {updateBooksInfo} from "../../../../src/service/watchList/book-info";
import {NotionClientHelper} from "../../../../src/helper/notion-client-helper";

describe("Update Book Info Test", () => {
  test("Update book info", async () => {
    const notionClient = new NotionClientHelper(process.env.NOTION_TOKEN);
    const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";
    const result = await updateBooksInfo(notionClient, watchListDBId);
    expect(result).toBeTruthy();
  });
});