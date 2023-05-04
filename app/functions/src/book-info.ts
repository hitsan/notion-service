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

const featchLackedInfoBook = async (notion: Client): Promise<LackedInfoBook[]> => {
  const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID;
  if (!watchListDBId) {
    functions.logger.error("Do not find:NOTION_WATCHLIST_DATABASE_ID", {structuredData: true});
    throw new Error("Do not find:NOTION_WATCHLIST_DATABASE_ID");
  }
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
                property: "PublishedDate",
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
      const title = result.properties.Title.title[0].plain_text;
      return {id: result.id, title: title};
    });
    return bookList;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
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
    const cover = `https://cover.openbd.jp/${isbn}.jpg`;

    return {id: lackedBook.id, authors, title, cover, publishedDate};
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

const updateBookInfo = async (notion: Client, bookInfo: BookInfo) => {
  try {
    await notion.pages.update({
      page_id: bookInfo.id,
      icon: {
        emoji: "📕",
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: bookInfo.title,
              },
            },
          ],
        },
        Author: {
          rich_text: [
            {
              text: {
                content: bookInfo.authors,
              },
            },
          ],
        },
        PublishedDate: {
          date: {
            start: bookInfo.publishedDate,
            end: null,
            time_zone: null,
          },
        },
        Image: {
          files: [
            {
              name: bookInfo.cover,
              external: {
                url: bookInfo.cover,
              },
            },
          ],
        },
      },
    });
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const updateBooksInfo = async () => {
  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    functions.logger.error("Do not find NOTION_TOKEN", {structuredData: true});
    throw new Error("Do not find NOTION_TOKEN");
  }
  const notion = new Client({auth: notionToken});
  try {
    const lackedBooks = await featchLackedInfoBook(notion);
    await Promise.all(lackedBooks.map(
      async (book: LackedInfoBook) => {
        const info = await featchBookInfo(book);
        updateBookInfo(notion, info);
      },
    ));
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
