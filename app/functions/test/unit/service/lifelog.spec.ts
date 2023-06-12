import {addPageToLifelog} from "../../../src/service/lifelog";
import axios from "axios";

jest.mock("axios");
describe("Adding Life Log Test", () => {
  const date: string = "2023-05-03"
  const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID || "";
  const nomalMockData = {
    data: {
      hourly: {
        temperature_2m: [
          12.1,
          11.9,
          11.3,
          10.0,
          9.3,
          8.8,
          9.1,
          11.1,
          13.7,
          16.1,
          18.1,
          19.8,
          21.1,
          22.1,
          22.6,
          22.0,
          21.4,
          20.6,
          19.6,
          18.4,
          17.5,
          16.8,
          15.9,
          15.1
        ],
        weathercode: [
          0,
          0,
          0,
          1,
          2,
          1,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          1,
          2,
          2,
          1,
          1,
          0,
          0,
          0,
          0,
          0
        ]
      }
    }
  };

  test("Get weather info", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(nomalMockData);
    const result = await addPageToLifelog(date, databaseId);
    expect(result).toBeTruthy();
  });
});