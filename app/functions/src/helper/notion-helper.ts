import {Client} from "@notionhq/client";
import * as functions from "firebase-functions";
import {TargeBook} from "../service/watchList/book-info";

interface SearchdQuery {
  database_id: string,
  filter: any,
}

/**
 * Notion Helper
 */
export class NotionHelper {
  private static notion: Client = (()=>{
    const notionToken = process.env.NOTION_TOKEN;
    if (!notionToken) throw new Error("Do not find NOTION_TOKEN");
    return new Client({auth: notionToken});
  })();

  /**
  * Get book contents
  * @param {string} dbId ID of DB
  * @param {object} query Filter
  */
  static async featchDbBookContents(dbId: string, query: object): Promise<TargeBook[]> {
    const filteringQuery: SearchdQuery = {database_id: dbId, filter: query};
    try {
      const response = await this.notion.databases.query(filteringQuery);
      const bookList = response.results.map((result) => {
        if (!("properties" in result && "title" in result.properties.Title)) {
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
  }
}
