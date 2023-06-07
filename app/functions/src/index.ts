import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";
import {formatInTimeZone} from "date-fns-tz";
import {updateBooksInfo} from "./service/watchList/book-info";
import {updateRestrauntInfo} from "./service/restraunt/restraunt";
import {addPageToLifelog} from "./service/lifelog";

const notionToken = process.env.NOTION_TOKEN;
if (!notionToken) throw new Error("Do not find NOTION_TOKEN");
const notion = new Client({auth: notionToken});

export const addBookInfo = functions.region("asia-northeast1").https.onRequest(
  async (request, response) => {
    try {
      const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID;
      if (!watchListDBId) throw new Error("Do not find NOTION_WATCHLIST_DATABASE_ID");

      await updateBooksInfo(watchListDBId);
      response.send("Succese update book list");
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      response.send("Failed update book list");
    }
  }
);


export const addRestrauntInfo = functions.region("asia-northeast1").https.onRequest(
  async (request, response) => {
    try {
      const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID;
      if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");

      await updateRestrauntInfo(notion, restrauntDBId);
      response.send("Succese update restraunt list");
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      response.send("Failed update restraunt list");
    }
  }
);

const timeZone = "Asia/Tokyo";
exports.scheduledFunctionCrontab = functions
  .region("asia-northeast1").pubsub
  .schedule("0 6 * * *")
  .timeZone(timeZone)
  .onRun(async () => {
    try {
      const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID;
      if (!databaseId) throw new Error("Not found NOTION_LIFELOG_DATABASE_ID");
      const date = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
      await addPageToLifelog(date, notion, databaseId);
      functions.logger.info("Succese dairy task", {structuredData: true});
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
    }
  });
