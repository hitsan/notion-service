import { BookPageData, isBookPageData } from "../service/watchList/book-info";
import {
  RestrauntPageData,
  isRestrauntPageData,
} from "../service/restraunt/restraunt";

export type PageProperties = {
  page_id: string;
  properties: object;
};

type Query = {
  (data: BookPageData): PageProperties;
  (data: RestrauntPageData): PageProperties;
};

export const convertNotionData: Query = (
  data: BookPageData | RestrauntPageData,
): PageProperties => {
  if (isBookPageData(data)) {
    const query: PageProperties = {
      page_id: data.pageId,
      properties: {
        Name: {
          title: [
            {
              text: {
                content: data.name,
              },
            },
          ],
        },
        Author: {
          rich_text: [
            {
              text: {
                content: data.author,
              },
            },
          ],
        },
        PublishedDate: {
          date: {
            start: data.publishedDate,
            end: null,
            time_zone: null,
          },
        },
        Image: {
          files: [
            {
              name: data.image.toString(),
              external: {
                url: data.image.toString(),
              },
            },
          ],
        },
      },
    };
    return query;
  } else if (isRestrauntPageData(data)) {
    const query = {
      page_id: data.pageId,
      properties: {
        GoogleMap: {
          url: data.googleMap,
        },
        URL: {
          url: data.url,
        },
        Image: {
          files: [
            {
              name: data.image.toString(),
              external: {
                url: data.image.toString(),
              },
            },
          ],
        },
      },
    };
    return query;
  }
  throw new Error("Cannot convert data");
};
