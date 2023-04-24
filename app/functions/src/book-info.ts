import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";
import axios from "axios";

export const featchWatchListBookInfo = async () => {
  const notion = new Client({auth: process.env.NOTION_TOKEN});
  const databaseId = process.env.NOTION_WATCHLIST_DATABASE_ID || "";

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Categry",
            select: {
              equals: "Book"
            },
          },
          {
            or:[
              {
                property: "Author",
                rich_text: {
                  is_empty: true
                },
              },
              {
                property: "Published Date",
                date: {
                  is_empty: true
                },
              },
              {
                property: "Image",
                files: {
                  is_empty: true
                },
              },
            ],
          },
        ],
      },
    });
    functions.logger.info("Success! get watchlist.", {structuredData: true});
    const a = response.results.map(result => {
      if (!("properties" in result)) return;
      if (!("title" in result.properties.Title)) return;
      return result.id + "," + result.properties.Title.title[0].plain_text;
    })
    return a;
  } catch (error) {
    functions.logger.info("Failed! get watchlist", {structuredData: true});
    throw new Error("Failed to get watchlist");
  }
}

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
