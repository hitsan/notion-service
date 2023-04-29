import * as functions from "firebase-functions";
import {DairyTaskInfo} from "./dairy-task"

export const addPageToRoutine = async (dairyTaskInfo: DairyTaskInfo) => {
  const databaseId = process.env.NOTION_ROUTINE_DATABASE_ID;
  if (!databaseId) {
    functions.logger.error("Do not find:NOTION_LIFELOG_DATABASE_ID", {structuredData: true});
    throw new Error("Do not find:NOTION_LIFELOG_DATABASE_ID");
  }
  const date = dairyTaskInfo.date;
  const title = dairyTaskInfo.title;
  const notion = dairyTaskInfo.notion;
  try {
    await notion.pages.create({
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
    functions.logger.info("Success! added routine:" + title, {structuredData: true});
  } catch (error) {
    functions.logger.info("Failed! added routine:" + title, {structuredData: true});
    throw new Error("Failed! added routine");
  }
};
