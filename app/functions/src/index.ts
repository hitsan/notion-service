import * as functions from "firebase-functions";
import {addPageToLifelog} from "./lifelog";

const jst = "Asia/Tokyo";

export const helloWorld = functions.https.onRequest(
  async (request, response) => {
    addPageToLifelog(jst);
    response.send("Add a page to Life Log!");
  });

exports.scheduledFunctionCrontab = functions.pubsub.schedule("0 0 * * *")
  .timeZone(jst)
  .onRun(() => {
    functions.logger.info("Add a page to Life Log!", {structuredData: true});
  });
