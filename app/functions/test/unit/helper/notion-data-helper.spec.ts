import {BookSearchQuery} from "../../../src/service/watchList/book-info"
import {convertNotionData} from "../../../src/helper/notion-data-helper"

describe("Notion data convert test", () => {
  test("convert data test", () => {
    const mockData = {};
    const query: BookSearchQuery = {database_id: "ss", filter: {}}
    const result = convertNotionData(query);
    expect(result).toEqual(mockData);
  });
});