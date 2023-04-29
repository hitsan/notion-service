import * as functions from "firebase-functions";
import {DairyTaskInfo} from "./dairy-task"

export const addPageToRoutine = async (dairyTaskInfo: DairyTaskInfo) => {
  const databaseId = process.env.NOTION_ROUTINE_DATABASE_ID;
  const notionToken = process.env.NOTION_TOKEN;
  if (!(databaseId && notionToken)) {
    let message = "Do not find:";
    if (!databaseId) message += "NOTION_LIFELOG_DATABASE_ID ";
    if (!notionToken) message += "NOTION_TOKEN ";
    functions.logger.error(message, {structuredData: true});
    throw new Error(message);
  }
  const date = dairyTaskInfo.date;
  const title = dairyTaskInfo.title;
  const notion = dairyTaskInfo.notion;
  try {
    return await notion.pages.create({
      parent: {database_id: databaseId},
      properties: {
        date: {
          date: {
            start: date,
            end: null,
            time_zone: null,
          },
        },
        Date: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
    });
    // functions.logger.info("Success! added routine.", {structuredData: true});
    // return;
  } catch (error) {
    functions.logger.info("Failed! added routine", {structuredData: true});
    throw new Error("Failed! added routine");
  }
};
