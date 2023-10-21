import * as functions from "firebase-functions";
import {updateBooksInfo} from "./service/watchList/book-info";
import {updateRestrauntInfo} from "./service/restraunt/restraunt";
import {addPageToLifelog} from "./service/lifelog";
import {NotionClientHelper} from "./helper/notion-client-helper";

export const timeZone = "Asia/Tokyo";

exports.scheduledFunctionCrontab = functions
  .region("asia-northeast1").pubsub
  .schedule("0 6 * * *")
  .timeZone(timeZone)
  .onRun(async () => {
    const notionClientHelper = new NotionClientHelper(process.env.NOTION_TOKEN,
      process.env.NOTION_LIFELOG_DATABASE_ID,
      process.env.NOTION_RESTRAUNT_DATABSE_ID);
    try {
      const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID;
      if (!watchListDBId) throw new Error("Do not find NOTION_WATCHLIST_DATABASE_ID");

      const resultLigeLog = addPageToLifelog(notionClientHelper);
      const resultUpdateBooks = updateBooksInfo(notionClientHelper, watchListDBId);
      const resultUpdateRestraunt = updateRestrauntInfo(notionClientHelper);

      await Promise.all([resultLigeLog, resultUpdateBooks, resultUpdateRestraunt]);

      functions.logger.info("Succese dairy task", {structuredData: true});
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
    }
  });
