import * as functions from "firebase-functions";
import axios from "axios";

interface BookInfo {
  authors: string;
  cover?: string;
  publishedDate: string;
}

export const featchBookInfo = async (title: string): Promise<BookInfo> => {
  const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${title}`;
  try {
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const bookInfo = googleBooksResponse.data.items[0].volumeInfo;
    const authors = bookInfo.authors.join(",");
    const publishedDate = bookInfo.publishedDate;
    const industryIdentifiers = bookInfo.industryIdentifiers;
    const isbn = industryIdentifiers.pop().identifier;

    const openBDUrl = `https://api.openbd.jp/v1/get?isbn=${isbn}`;
    const openBDResponse = await axios.get(openBDUrl);
    const cover = openBDResponse.data[0].summary?.cover;

    return {authors, cover, publishedDate};
  } catch (error: unknown) {
    functions.logger.error("Failed to fetch book info", error);
    throw new Error("Failed to fetch book info");
  }
};
