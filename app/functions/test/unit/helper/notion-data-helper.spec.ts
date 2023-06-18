import { ImageUrl } from "../../../src/service/utils/imageUrl";
import {BookUpdateData} from "../../../src/service/watchList/book-info"
import {convertNotionData} from "../../../src/helper/notion-data-helper"

describe("Notion data convert test", () => {
  test("convert update data test", () => {
    const id = "id";
    const icon = "📕";
    const name = "test_name";
    const author = "test_author";
    const publishedDate = "2020/12/01";
    const image = new ImageUrl("https://www.test/test.jpg");
    const query: BookUpdateData = {
      pageId: id,
      icon: icon,
      name: name,
      author: author,
      publishedDate: publishedDate,
      image: image,
    };
    const mockData = {
      page_id: id,
      icon: {
        emoji: icon,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Author: {
          rich_text: [
            {
              text: {
                content: author,
              },
            },
          ],
        },
        PublishedDate: {
          date: {
            start: publishedDate,
            end: null,
            time_zone: null,
          },
        },
        Image: {
          files: [
            {
              name: image,
              external: {
                url: image,
              },
            },
          ],
        },
      },
    };
    const result = convertNotionData(query);
    expect(result).toEqual(mockData);
  });
});