import {NotionHelper} from "../../../src/helper/notion-helper";

describe("Notion Helper function test", () => {
  test("featch test", async () => {
    const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";
    const query = {
      property: "Categry",
      select: {
        equals: "Book",
      },
    };
    const response = await NotionHelper.featchDbBookContents(watchListDBId, query);
    response.forEach((value) => {
      console.log(`${value.id} : ${value.title}`)
    })
    expect(true).toEqual(true);
  });
});