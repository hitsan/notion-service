import {BookData, isBookData} from "../service/watchList/book-info"

type Query = {
  (data: BookData): object;
};
  
export const convertNotionData: Query = (data: BookData): object => {
  if (isBookData(data)) {
    const query  = {
      page_id: data.pageId,
      icon: {
        emoji: data.icon
      },
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
              name: data.image,
              external: {
                url: data.image,
              },
            },
          ],
        },
      },
    };
    return query;
  } else {
    return {data};
  }
}