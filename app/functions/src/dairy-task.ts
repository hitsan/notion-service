import {Client} from "@notionhq/client";
import {formatInTimeZone} from "date-fns-tz";
import * as functions from "firebase-functions";
import {addPageToLifelog} from "./lifelog";
import {addPageToRoutine} from "./routine";

export interface DairyTaskInfo {
    date: string;
    title: string;
    notion: Client;
  }

export const dairyTask = async (jst: string) => {
  const date = formatInTimeZone(new Date(), jst, "yyyy-MM-dd");
  const title = formatInTimeZone(new Date(), jst, "yyyy/MM/dd");

  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    functions.logger.error("Do not find NOTION_TOKEN", {structuredData: true});
    throw new Error("Do not find NOTION_TOKEN");
  }
  const notion = new Client({auth: notionToken});
  const dairyTaskInfo: DairyTaskInfo = {date, title, notion};
  functions.logger.info("ssssssssssssssss", {structuredData: true});
  try {
    return await Promise.all([addPageToLifelog(dairyTaskInfo), addPageToRoutine(dairyTaskInfo)]);
  } catch (error: unknown) {
    throw new Error("Failed dairyTask");
  }
};
