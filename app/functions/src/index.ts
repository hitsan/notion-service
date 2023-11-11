import * as functions from "firebase-functions";
import { updateBooksInfo } from "./service/watchList/book-info";
import { updateRestrauntInfo } from "./service/restraunt/restraunt";
import { addPageToLifelog } from "./service/lifelog";
import { NotionClientHelper } from "./helper/notion-client-helper";
import { retry } from "./helper/types";
import { onRequest } from "firebase-functions/v2/https";

export const timeZone = "Asia/Tokyo";
const region = "asia-northeast1";

// exports.addpage = onRequest(
//   { timeoutSeconds: 1200, region: [region] },
//   (req, res) => {
//     const notionClientHelper = new NotionClientHelper(
//       process.env.NOTION_TOKEN,
//       process.env.NOTION_LIFELOG_DATABASE_ID,
//       process.env.NOTION_RESTRAUNT_DATABSE_ID,
//     );
//     retry(addPageToLifelog, notionClientHelper, 3);
//   },
// );

exports.shop = onRequest(
  { timeoutSeconds: 1200, region: [region] },
  (req, res) => {
  const notionClientHelper = new NotionClientHelper(
    process.env.NOTION_TOKEN,
    process.env.NOTION_LIFELOG_DATABASE_ID,
    process.env.NOTION_RESTRAUNT_DATABSE_ID,
  );
  updateRestrauntInfo(notionClientHelper);
});

exports.scheduledFunctionCrontab = functions
  .region(region)
  .pubsub.schedule("0 6 * * *")
  .timeZone(timeZone)
  .onRun(async () => {
    const notionClientHelper = new NotionClientHelper(
      process.env.NOTION_TOKEN,
      process.env.NOTION_LIFELOG_DATABASE_ID,
      process.env.NOTION_RESTRAUNT_DATABSE_ID,
    );
    try {
      const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID;
      if (!watchListDBId)
        throw new Error("Do not find NOTION_WATCHLIST_DATABASE_ID");

      const resultLigeLog = retry(addPageToLifelog, notionClientHelper, 3, 5);
      const resultUpdateBooks = updateBooksInfo(
        notionClientHelper,
        watchListDBId,
      );
      const resultUpdateRestraunt = updateRestrauntInfo(notionClientHelper);

      await Promise.all([
        resultLigeLog,
        resultUpdateBooks,
        resultUpdateRestraunt,
      ]);

      functions.logger.info("Succese dairy task", { structuredData: true });
    } catch (error) {
      functions.logger.error(error, { structuredData: true });
    }
  });
