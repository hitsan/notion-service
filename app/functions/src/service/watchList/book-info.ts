import * as functions from "firebase-functions";
import {WatchListInfo} from "./watchList";
import {ImageUrl} from "../utils/imageUrl";
import {NotionHelper} from "../../../src/helper/notion-client-helper";
import {convertNotionData} from "../../../src/helper/notion-data-helper";
import axios from "axios";

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

export type BookSearchQuery = {
  database_id: string;
  filter: object;
};

export type BookUpdateData = {
  pageId: string;
  icon: string;
  name: string;
  author: string;
  publishedDate: string;
  image: ImageUrl;
};

export const isBookUpdateData = (item: any): item is BookUpdateData => {
  const typed = item as BookUpdateData;
  if (("pageId" in typed) && ("icon" in typed) && ("name" in typed) && ("author" in typed) && ("publishedDate" in typed) && ("image" in typed)) {
    return true;
  }
  return false;
}

const featcSearchTargetBooks = async (watchListDBId: string) => {
  const properties = {
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
    const bookList = await NotionHelper.featchPageIdsFromDB(watchListDBId, properties);
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

const updateBookInfo = async (pageId: string, bookInfo: BookInfo) => {
  const properties: BookUpdateData = {
    pageId: pageId,
    icon: "📕",
    name: bookInfo.title,
    author: bookInfo.authors,
    publishedDate: bookInfo.publishedDate,
    image: bookInfo.coverUrl,
  };
  const query = convertNotionData(properties);
  try {
    await NotionHelper.updatePageProperties(query);
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const updateBooksInfo = async (watchListDBId: string) => {
  try {
    const targetBooks = await featcSearchTargetBooks(watchListDBId);
    await Promise.all(targetBooks.map(
      async (book) => {
        const BookInfo = await featchBookInfo(book.title);
        updateBookInfo(book.id, BookInfo);
      },
    ));
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
