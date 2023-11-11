import {NotionClientHelper} from "../../../src/helper/notion-client-helper";
import {addPageToLifelog} from "../../../src/service/lifelog";
import axios from "axios";

jest.mock("axios");
describe("Adding Life Log Test", () => {
  const notionClientHelper = new NotionClientHelper(
    process.env.NOTION_TOKEN,
    process.env.NOTION_LIFELOG_DATABASE_ID,
    process.env.NOTION_RESTRAUNT_DATABSE_ID,
  );

  test("Add life Log page", async () => {
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
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(nomalMockData);
    const result = await addPageToLifelog(notionClientHelper);
    expect(result).toBeTruthy();
  });

  test("Iligal weather code", () => {
    const mockData = {
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
            100,
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
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(mockData);
    const addPageToLifelogPromise =  addPageToLifelog(notionClientHelper);
    expect(addPageToLifelogPromise).rejects.toThrow("Iligal weather code");
  });
});