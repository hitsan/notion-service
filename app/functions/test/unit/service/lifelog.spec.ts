import {addPageToLifelog} from "../../../src/service/lifelog";
import axios from "axios";

jest.mock("axios");
describe("Adding Life Log Test", () => {
  const nomalMockData = {
    data: {
      hourly: {
        time: [
          "2023-05-03T00:00",
          "2023-05-03T01:00",
          "2023-05-03T02:00",
          "2023-05-03T03:00",
          "2023-05-03T04:00",
          "2023-05-03T05:00",
          "2023-05-03T06:00",
          "2023-05-03T07:00",
          "2023-05-03T08:00",
          "2023-05-03T09:00",
          "2023-05-03T10:00",
          "2023-05-03T11:00",
          "2023-05-03T12:00",
          "2023-05-03T13:00",
          "2023-05-03T14:00",
          "2023-05-03T15:00",
          "2023-05-03T16:00",
          "2023-05-03T17:00",
          "2023-05-03T18:00",
          "2023-05-03T19:00",
          "2023-05-03T20:00",
          "2023-05-03T21:00",
          "2023-05-03T22:00",
          "2023-05-03T23:00"
        ],
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
        relativehumidity_2m: [
          81,
          81,
          82,
          84,
          79,
          78,
          71,
          55,
          45,
          49,
          55,
          55,
          55,
          54,
          53,
          55,
          57,
          60,
          63,
          67,
          70,
          73,
          78,
          84
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

  const date: string = "2023-05-03"
  const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID || "";

  test("Get weather info", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(nomalMockData);
    const result = await addPageToLifelog(date, databaseId);
    expect(result).toBeTruthy();
  });
});