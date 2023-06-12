import * as dotenv from "dotenv";
import {Client} from "@notionhq/client";

dotenv.config({ path: ".env.local" });

const notionToken = process.env.NOTION_TOKEN || "";
const notion: Client = new Client({auth: notionToken});

// Clear Notion test page
const clearUpdatePages = () => {
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

clearUpdatePages();