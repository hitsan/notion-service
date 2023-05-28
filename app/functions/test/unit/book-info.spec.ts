import {updateBooksInfo, featchBookInfo} from "../../src/watchList/book-info";
// import {mockedData} from "./book-info-test-data"
import {Client} from "@notionhq/client";
import axios from "axios";

jest.mock("axios");
describe("Update Book Info Test", () => {
  const notionToken = process.env.NOTION_TOKEN || "";
  const notion = new Client({auth: notionToken});
//   jest.mock("notion");

  const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";

  test("Get Book info", async () => {
    const mockedData = {
      data: {
        items: [
          {
            volumeInfo: {
              authors: ["JK"],
              title: "ハリー・ポッターと秘密の部屋",
              publishedDate: "2000/12/12",
              industryIdentifiers: [
                {
                  "type": "ISBN_10",
                  "identifier": "4915512398"
                },
                {
                  "type": "ISBN_13",
                  "identifier": "9784915512391"
                }
              ]
            }
          }
        ]
      }
    };
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(mockedData);

    const title = "ハリー・ポッターと秘密の部屋";
    const result = await featchBookInfo(title);
    expect(result.authors).toEqual("JK");
    expect(result.title).toEqual("ハリー・ポッターと秘密の部屋");
    expect(result.publishedDate).toEqual("2000/12/12");
  });

  test("Update book info", async () => {
    // (notion.databases.query as jest.MockedFunction<typeof notion.databases.query>).mockResolvedValueOnce(mockedData);
    const result = await updateBooksInfo(notion, watchListDBId);
    expect(result).toBeTruthy();
  });
});