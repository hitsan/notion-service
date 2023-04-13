import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";

const postRoutinePage = (date:string, title:string) => {
  const notion = new Client({auth: process.env.NOTION_TOKEN});
  const databaseId = process.env.NOTION_ROUTINE_DATABASE_ID || "";

  try {
    notion.pages.create({
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
    functions.logger.info("Success! added routine.", {structuredData: true});
  } catch (error) {
    functions.logger.info("Failed! added routine", {structuredData: true});
  }
};

export const addPageToRoutine = async (title:string, date:string) => {
  postRoutinePage(date, title);
};
