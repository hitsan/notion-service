import * as dotenv from "dotenv";
import {Client} from "@notionhq/client";

dotenv.config({ path: ".env.local" });

const notionToken = process.env.NOTION_TOKEN || "";
const notion: Client = new Client({auth: notionToken});

const clearUpdateDb = () => {
  const updatePage = process.env.TEST_UPDATE_PAGE || "";
  const properties = {
    Name: {
      title: [
        {
          text: {
            content: "",
          },
        },
      ],
    },
    Tags: {
      multi_select: [],
    },
  };
  const query = {page_id: updatePage, properties: properties};
  notion.pages.update(query);
}

const clearCreateDb = async () => {
  const createPageDbId = process.env.TEST_CREATE_PAGE_DB || "";
  const response = await notion.databases.query({database_id: createPageDbId});
  (response.results).map(async (result) => {
    const pageId = result.id;
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
  })
}

const setUp = () => {
  Promise.all([clearUpdateDb, clearCreateDb]);
}

setUp();