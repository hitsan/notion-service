import {Client} from "@notionhq/client";
import * as functions from "firebase-functions";
import {TargeBook} from "../service/watchList/book-info";

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
  * Get page contents
  * @param {string} dbId ID of DB
  * @param {object} query Filter
  */
  private static async featchPageIds(dbId: string, query: object) {
    const filteringQuery: {database_id: string, filter: any,} = {database_id: dbId, filter: query};
    try {
      const response = await this.notion.databases.query(filteringQuery);
      return response.results;
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }

  /**
  * Get book contents
  * @param {string} dbId ID of DB
  * @param {object} query Filter
  */
  static async featchBookPageProperties(dbId: string, query: object): Promise<TargeBook[]> {
    try {
      const response = await this.featchPageIds(dbId, query);
      const bookList = response.map((result) => {
        if (!("properties" in result && "title" in result.properties.Name)) {
          throw new Error("Ilegal data");
        }
        const title = result.properties.Name.title[0].plain_text;
        return {id: result.id, title: title};
      });
      return bookList;
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }

  /**
  * Get restraunt page properties
  * @param {string} dbId ID of DB
  * @param {object} query Filter
  */
   static async featchRestrauntPageProperties(dbId: string, query: object): Promise<TargeBook[]> {
    try {
      const response = await this.featchPageIds(dbId, query);
      const restraunta = response.map((result) => {
        if (!("properties" in result && "title" in result.properties.Name)) {
          throw new Error("Ilegal data");
        }
        const title = result.properties.Name.title[0].plain_text;
        return {id: result.id, title: title};
      });
      return restraunta;
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }
}
