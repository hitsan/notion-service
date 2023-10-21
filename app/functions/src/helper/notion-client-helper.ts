import {Client} from "@notionhq/client";
import * as functions from "firebase-functions";
import {PageProperties} from "../helper/notion-data-helper";

type DatabaseId = string;

export interface ClientHelper {
  notion: Client;
  lifelogDabase: DatabaseId;
  restrauntDBId: DatabaseId;
  featchPageIdsFromDB: (dbId: string, properties: object) => Promise<{id: string, title: string}[]>;
  updatePageProperties: (query: PageProperties) => void;
  createPage: (databaseId: string, icon: string, properties: object) => void;
}

/**
 * Notion Helper
 */
export class NotionClientHelper implements ClientHelper {
  notion: Client;
  lifelogDabase: DatabaseId;
  restrauntDBId: DatabaseId;
  /**
  * constructor
  * @param {string | undefined} notionToken Access token
  */
  constructor(notionToken: string | undefined, lifelogDabase: DatabaseId | undefined,
    restrauntDBId: DatabaseId | undefined) {
    if (!notionToken) throw new Error("Do not set NOTION_TOKEN");
    this.notion = new Client({auth: notionToken});
    if (!lifelogDabase) throw new Error("Not found NOTION_LIFELOG_DATABASE_ID");
    this.lifelogDabase = lifelogDabase;
    if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");
    this.restrauntDBId = restrauntDBId
  }

  getString(dbId: DatabaseId): String {
    return dbId
  }

  /**
  * Get page contents
  * @param {string} dbId ID of DB
  * @param {object} properties Filtering properties
  * @todo (databaseName: String, f(propertie: object)=>Boolean) => Promise<{id: string, title: string}[]>
  */
  async featchPageIdsFromDB(dbId: string, properties: object): Promise<{id: string, title: string}[]> {
    const filteringQuery: {database_id: string, filter: any} = {database_id: dbId, filter: properties};
    try {
      const response = await this.notion.databases.query(filteringQuery);
      const properties = response.results;
      const idList = properties.map((result) => {
        if (!("properties" in result)) {
          throw new Error("Ilegal data");
        }
        for (const recode in result.properties) {
          if (!({}.hasOwnProperty.call(result.properties, recode))) {
            continue;
          }
          const property = result.properties[recode];
          if ("title" in property) {
            const title = property.title[0].plain_text;
            const id = result.id;
            return {id: id, title: title};
          }
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
  * @param {PageProperties} query Filtering properties
  * @todo Make Emoji Type
  */
  async updatePageProperties(query: PageProperties) {
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
  * @param {DatabaseId} databaseId ID of DB
  * @param {string} icon icon
  * @param {object} properties Filtering properties
   */
  async createPage(databaseId: DatabaseId, icon: string, properties: object) {
    const database = {database_id: databaseId};
    const creatingQuery: {parent: {database_id: string}, icon: any, properties: any,} = {
      parent: database,
      icon: {emoji: icon},
      properties,
    };
    try {
      const response = await this.notion.pages.create(creatingQuery);
      return (!!response);
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      throw error;
    }
  }
}
