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
      const id = process.env.TEST_HARRY_PAGE_ID;
      if (value.id === id) {
        expect(value.title).toEqual("ハリー・ポッターと秘密の部屋");
      } else {
        throw new Error("Can not get book data!")
      }
    })
  });
});