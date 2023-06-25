import * as functions from "firebase-functions";
import {formatInTimeZone} from "date-fns-tz";
import {updateBooksInfo} from "./service/watchList/book-info";
import {updateRestrauntInfo} from "./service/restraunt/restraunt";
import {addPageToLifelog} from "./service/lifelog";

// export const addBookInfo = functions.region("asia-northeast1").https.onRequest(
//   async (request, response) => {
//     try {
//       const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID;
//       if (!watchListDBId) throw new Error("Do not find NOTION_WATCHLIST_DATABASE_ID");

//       await updateBooksInfo(watchListDBId);
//       response.send("Succese update book list");
//     } catch (error) {
//       functions.logger.error(error, {structuredData: true});
//       response.send("Failed update book list");
//     }
//   }
// );


// export const addRestrauntInfo = functions.region("asia-northeast1").https.onRequest(
//   async (request, response) => {
//     try {
//       const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID;
//       if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");

//       await updateRestrauntInfo(restrauntDBId);
//       response.send("Succese update restraunt list");
//     } catch (error) {
//       functions.logger.error(error, {structuredData: true});
//       response.send("Failed update restraunt list");
//     }
//   }
// );

const timeZone = "Asia/Tokyo";
exports.scheduledFunctionCrontab = functions
  .region("asia-northeast1").pubsub
  .schedule("0 6 * * *")
  .timeZone(timeZone)
  .onRun(async () => {
    try {
      const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID;
      if (!databaseId) throw new Error("Not found NOTION_LIFELOG_DATABASE_ID");
      const watchListDBId = process.env.NOTION_WATCHLIST_DATABASE_ID;
      if (!watchListDBId) throw new Error("Do not find NOTION_WATCHLIST_DATABASE_ID");
      const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID;
      if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");

      const date = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
      const resultLigeLog = addPageToLifelog(date, databaseId);
      const resultUpdateBooks = updateBooksInfo(watchListDBId);
      const resultUpdateRestraunt = updateRestrauntInfo(restrauntDBId);

      await Promise.all([resultLigeLog, resultUpdateBooks, resultUpdateRestraunt]);
  
      functions.logger.info("Succese dairy task", {structuredData: true});
    } catch (error) {
      functions.logger.error(error, {structuredData: true});
    }
  });
