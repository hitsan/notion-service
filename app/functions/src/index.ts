import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";
import {formatInTimeZone} from "date-fns-tz";
import {updateBooksInfo} from "./book-info";
import {addPageToLifelog} from "./lifelog";

export const addBookInfo = functions.region("asia-northeast1").https.onRequest(
  async (request, response) => {
    try {
      await updateBooksInfo();
      response.send("Succese update book list");
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
      response.send("Failed update book list");
    }
  });

const timeZone = "Asia/Tokyo";
exports.scheduledFunctionCrontab = functions
  .region("asia-northeast1").pubsub
  .schedule("0 6 * * *")
  .timeZone(timeZone)
  .onRun(async () => {
    try {
      const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID;
      if (!databaseId) throw new Error("Not found NOTION_LIFELOG_DATABASE_ID");
      const notionToken = process.env.NOTION_TOKEN;
      if (!notionToken) throw new Error("Not found NOTION_TOKEN");
      const notion = new Client({auth: notionToken});
      const date = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
      await addPageToLifelog(date, notion, databaseId);
      functions.logger.info("Succese dairy task", {structuredData: true});
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
    }
  });
