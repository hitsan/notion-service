import {featchShishaPlaceId} from "../../src/restraunt";
// import {Client} from "@notionhq/client";
// import axios from "axios";

// jest.mock("axios");
describe("Adding shisha Test", () => {
  // const databaseId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";
  // const notionToken = process.env.NOTION_TOKEN || "";
  // const notion = new Client({auth: notionToken});

  test("Get shisha info", async () => {
    // (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(mockedData);
    const result = await featchShishaPlaceId();
    expect(result).toBeTruthy();
  });
});