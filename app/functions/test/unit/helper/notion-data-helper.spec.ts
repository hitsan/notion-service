import { ImageUrl } from "../../../src/service/utils/imageUrl";
import {BookPageData} from "../../../src/service/watchList/book-info";
import {RestrauntPageData} from "../../../src/service/restraunt/restraunt";
import {convertNotionData} from "../../../src/helper/notion-data-helper";

describe("Notion data convert test", () => {
  test("convert book data test", () => {
    const id = "id";
    const icon = "📕";
    const name = "test_name";
    const author = "test_author";
    const publishedDate = "2020/12/01";
    const image = new ImageUrl("https://www.test/test.jpg");
    const query: BookPageData = {
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

  // test("convert restraunt data test", () => {
  //   const pageId = "id";
  //   const icon = "🍴";
  //   const name = "test_name";
  //   const category = "test_category";
  //   const googleMap = "https://www.googlemap.com";
  //   const image = new ImageUrl("https://www.test/test.jpg");;
  //   const url = "https://www.testshop/";

  //   const query: RestrauntPageData = {
  //     pageId: pageId,
  //     icon: icon,
  //     name: name,
  //     category: category,
  //     googleMap: googleMap,
  //     image: image,
  //     url: url,
  //   };
  // });
});