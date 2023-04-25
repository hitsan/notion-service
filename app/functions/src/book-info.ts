import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";
import axios from "axios";

interface LackedInfoBook {
  id: string;
  title: string;
}

interface BookInfo {
  id: string;
  authors: string;
  title: string;
  cover: string;
  publishedDate: string;
}

const notion = new Client({auth: process.env.NOTION_TOKEN});
const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";

const featchLackedInfoBook = async (): Promise<LackedInfoBook[]> => {
  try {
    const response = await notion.databases.query({
      database_id: watchListDBId,
      filter: {
        and: [
          {
            property: "Categry",
            select: {
              equals: "Book",
            },
          },
          {
            or: [
              {
                property: "Author",
                rich_text: {
                  is_empty: true,
                },
              },
              {
                property: "Published Date",
                date: {
                  is_empty: true,
                },
              },
              {
                property: "Image",
                files: {
                  is_empty: true,
                },
              },
            ],
          },
        ],
      },
    });
    const bookList = response.results.map((result) => {
      if (!("properties" in result) ||
        !("title" in result.properties.Title)) {
          throw new Error("Ilegal data");
      }
      return {id: result.id, title: result.properties.Title.title[0].plain_text};
    });
    return bookList;
  } catch (error) {
    functions.logger.info("Failed! get watchlist", {structuredData: true});
    throw new Error("Failed to get watchlist");
  }
};

const featchBookInfo = async (lackedBook: LackedInfoBook): Promise<BookInfo> => {
  const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${lackedBook.title}`;
  try {
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const bookInfo = googleBooksResponse.data.items[0].volumeInfo;
    const authors = bookInfo.authors.join(",");
    const title = bookInfo.title;
    const publishedDate = bookInfo.publishedDate;
    const industryIdentifiers = bookInfo.industryIdentifiers;
    const isbn = industryIdentifiers.pop().identifier;
    const cover = `https://cover.openbd.jp/${isbn}.jpg`

    return {id: lackedBook.id, authors, title, cover, publishedDate};
  } catch (error: unknown) {
    functions.logger.error("Failed to fetch book info", error);
    throw new Error("Failed to fetch book info");
  }
};

const updateBookInfo = async (bookInfo: BookInfo) => {
  const pageId = bookInfo.id;
  const title = bookInfo.title;
  const author = bookInfo.authors;
  const date = bookInfo.publishedDate;
  const cover = bookInfo.cover;
  try {
    await notion.pages.update({
      page_id: pageId,
      icon: {
        emoji: "📕",
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title,
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
        "Published Date": {
          date: {
            start: date,
            end: null,
            time_zone: null,
          },
        },
        Image: {
          files: [
            {
              name: cover,
              external: {
                url: cover,
              },
            },
          ],
        },
      },
    });
  } catch (error: unknown) {
    functions.logger.error("Failed to post book info", error);
    throw new Error("Failed to post book info");
  }
};

export const updateBooks = async () => {
  const lackedBooks = await featchLackedInfoBook();
  lackedBooks.map(book => {
    featchBookInfo(book).then((value) => {
      updateBookInfo(value)
    });
  });
};
