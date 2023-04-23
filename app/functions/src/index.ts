import * as functions from "firebase-functions";
import {formatInTimeZone} from "date-fns-tz";
import {addPageToLifelog} from "./lifelog";
import {addPageToRoutine} from "./routine";
import {featchBookInfo} from "./book-info"

const jst = "Asia/Tokyo";

const dairyTask = () => {
  const date = formatInTimeZone(new Date(), jst, "yyyy-MM-dd");
  const title = formatInTimeZone(new Date(), jst, "yyyy/MM/dd");
  addPageToLifelog(title, date);
  addPageToRoutine(title, date);
};

export const notionDairy = functions.region("asia-northeast1").https.onRequest(
  (request, response) => {
    dairyTask();
    response.send("Run dairy task");
  });

export const addBookInfo = functions.region("asia-northeast1").https.onRequest(
  async (request, response) => {
    const title = "文豪たちの悪口本";
    // const title = "アフターマン";
    const a = await featchBookInfo(title);
    response.send(a);
  });

exports.scheduledFunctionCrontab = functions
  .region("asia-northeast1").pubsub
  .schedule("0 6 * * *")
  .timeZone(jst)
  .onRun(() => {
    dairyTask();
    functions.logger.info("Run dairy task", {structuredData: true});
  });
