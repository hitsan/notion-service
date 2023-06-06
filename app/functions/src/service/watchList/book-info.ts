import * as functions from "firebase-functions";
import {TargetWatchList, WatchListInfo} from "./watchList";
import {ImageUrl} from "../utils/imageUrl";
import {Client} from "@notionhq/client";
import {NotionHelper} from "../../../src/helper/notion-helper";
import axios from "axios";

/**
 * Seaching target book.
 */
export class TargeBook implements TargetWatchList {
  /**
  * constructor.
  */
  constructor(public id: string, public name: string) {
    this.id = id;
    this.name = name;
  }
}

/**
 * Seached book infomation.
 */
class BookInfo implements WatchListInfo {
  /**
  * constructor.
  */
  constructor(
    public authors: string,
    public title: string,
    public coverUrl: ImageUrl,
    public publishedDate: string
  ) {
    this.authors = authors;
    this.title = title;
    this.coverUrl = coverUrl;
    this.publishedDate = publishedDate;
  }
}

const featcSearchTargetBooks = async (watchListDBId: string): Promise<TargeBook[]> => {
  const query = {
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
  };
  try {
    const bookList = await NotionHelper.featchBookPageProperties(watchListDBId, query);
    return bookList;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const featchBookInfo = async (title: string): Promise<BookInfo> => {
  const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${title}`;
  try {
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const bookInfo = googleBooksResponse.data.items[0].volumeInfo;
    const authors = bookInfo.authors.join(",");
    const title = bookInfo.title;
    const publishedDate = bookInfo.publishedDate;
    const industryIdentifiers = bookInfo.industryIdentifiers;
    const isbn = industryIdentifiers.pop().identifier;
    const coverUrl =new ImageUrl(`https://cover.openbd.jp/${isbn}.jpg`);

    return {authors, title, coverUrl, publishedDate};
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

const updateBookInfo = async (notion: Client, pageId: string, bookInfo: BookInfo) => {
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
              name: bookInfo.coverUrl.toString(),
              external: {
                url: bookInfo.coverUrl.toString(),
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

export const updateBooksInfo = async (notion: Client, watchListDBId: string) => {
  try {
    const targetBooks = await featcSearchTargetBooks(watchListDBId);
    await Promise.all(targetBooks.map(
      async (book: TargeBook) => {
        const BookInfo = await featchBookInfo(book.name);
        updateBookInfo(notion, book.id, BookInfo);
      },
    ));
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
