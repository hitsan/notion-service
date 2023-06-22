import {BookPageData, isBookPageData} from "../service/watchList/book-info"
import {RestrauntPageData, isRestrauntPageData} from "../service/restraunt/restraunt";

type Query = {
  (data: BookPageData): object;
  (data: RestrauntPageData): object;
};
  
export const convertNotionData: Query = (data: BookPageData | RestrauntPageData): object => {
  if (isBookPageData(data)) {
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
  } else if(isRestrauntPageData(data)) {
    const query  = {
      page_id: data.pageId,
      icon: {
        emoji: data.icon
      },
      properties: {
        // Name: {
        //   title: [
        //     {
        //       text: {
        //         content: data.name,
        //       },
        //     },
        //   ],
        // },
        Category: {
          select: {
            name: data.category,
          },
        },
        GoogleMap: {
          url: data.googleMap,
        },
        URL: {
          url: data.url,
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