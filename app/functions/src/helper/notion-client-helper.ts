import {Client} from "@notionhq/client";
import * as functions from "firebase-functions";
import {PageProperties} from "../helper/notion-data-helper"

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
  * @param {object} properties Filtering properties
  */
  static async featchPageIdsFromDB(dbId: string, properties: object): Promise<{id: string, title: string}[]> {
    const filteringQuery: {database_id: string, filter: any,} = {database_id: dbId, filter: properties};
    try {
      const response = await this.notion.databases.query(filteringQuery);
      const properties = response.results;
      const idList = properties.map((result) => {
        if (!("properties" in result)) { throw new Error("Ilegal data"); }
        for (const recode in result.properties) {
          const property = result.properties[recode];
          if (!("title" in property)) { continue; }
          const title = property.title[0].plain_text;
          const id = result.id;
          return {id: id, title: title};
        }
        throw new Error("Ilegal data");
      });
      return idList;
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }

  /**
  * Update page properties
  * @param {PageProperties} properties Filtering properties
  * @todo Make Emoji Type
  */
  static async updatePageProperties(query: PageProperties) {
    try {
      const response = await this.notion.pages.update(query as any);
      return !!response;
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }

  /**
   * Create page to DB
  * @param {string} databaseId ID of DB
  * @param {string} icon icon
  * @param {object} properties Filtering properties
   */
  static async createPage(databaseId: string, icon: string, properties: object) {
    const database = {database_id: databaseId};
    const creatingQuery: {parent: {database_id: string}, icon: any, properties: any,} = {
      parent: database,
      icon: {emoji: icon},
      properties,
    };
    const response = await this.notion.pages.create(creatingQuery);
    return (!!response);
  }
}
