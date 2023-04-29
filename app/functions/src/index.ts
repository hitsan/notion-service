import * as functions from "firebase-functions";
import {updateBooksInfo} from "./book-info";
import {dairyTask} from "./dairy-task";

export const addBookInfo = functions.region("asia-northeast1").https.onRequest(
  async (request, response) => {
    updateBooksInfo();
    response.send("Run update book list");
  });

const jst = "Asia/Tokyo";
exports.scheduledFunctionCrontab = functions
  .region("asia-northeast1").pubsub
  .schedule("0 6 * * *")
  .timeZone(jst)
  .onRun(async () => {
    try {
      await dairyTask(jst);
      functions.logger.info("Succese dairy task", {structuredData: true});
    } catch(error: unknown) {
      functions.logger.error("Failed dairyTask", {structuredData: true});
    }
  });
