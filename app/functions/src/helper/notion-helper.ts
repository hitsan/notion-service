import {Client} from "@notionhq/client";
import * as functions from "firebase-functions";
import {TargetWatchList} from "../service/watchList/watchList"

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
  static async featchPageIds(dbId: string, query: object): Promise<TargetWatchList[]> {
    const filteringQuery: {database_id: string, filter: any,} = {database_id: dbId, filter: query};
    try {
      const response = await this.notion.databases.query(filteringQuery);
      const properties = response.results;
      const idList = properties.map((result) => {
        if (!("properties" in result && "title" in result.properties.Name)) {
          throw new Error("Ilegal data");
        }
        const name = result.properties.Name.title[0].plain_text;
        return {id: result.id, name: name};
      });
      return idList;
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }

  // /**
  // * Get book contents
  // * @param {string} dbId ID of DB
  // * @param {object} query Filter
  // */
  // static async featchBookPageProperties(dbId: string, query: object): Promise<TargetWatchList[]> {
  //   try {
  //     const response = await this.featchPageIds(dbId, query);
  //     const bookList = response.map((result) => {
  //       if (!("properties" in result && "title" in result.properties.Name)) {
  //         throw new Error("Ilegal data");
  //       }
  //       const name = result.properties.Name.title[0].plain_text;
  //       return {id: result.id, name: name};
  //     });
  //     return bookList;
  //   } catch (error) {
  //     functions.logger.error(error, {structuredData: true});
  //     throw error;
  //   }
  // }

  // /**
  // * Get restraunt page properties
  // * @param {string} dbId ID of DB
  // * @param {object} query Filter
  // */
  //  static async featchRestrauntPageProperties(dbId: string, query: object): Promise<TargetWatchList[]> {
  //   try {
  //     const response = await this.featchPageIds(dbId, query);
  //     const restraunta = response.map((result) => {
  //       if (!("properties" in result && "title" in result.properties.Name)) {
  //         throw new Error("Ilegal data");
  //       }
  //       const name = result.properties.Name.title[0].plain_text;
  //       return {id: result.id, name: name};
  //     });
  //     return restraunta;
  //   } catch (error) {
  //     functions.logger.error(error, {structuredData: true});
  //     throw error;
  //   }
  // }
}
