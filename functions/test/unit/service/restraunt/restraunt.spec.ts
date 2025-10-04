import {updateRestrauntInfo} from "../../../../src/service/restraunt/restraunt";
import {NotionClientHelper} from "../../../../src/helper/notion-client-helper";

describe("Update shisha shop Info test", () => {
  const notionClient = new NotionClientHelper(
    process.env.NOTION_TOKEN,
    process.env.NOTION_LIFELOG_DATABASE_ID,
    process.env.NOTION_RESTRAUNT_DATABSE_ID,
  );
  test("update", async () => {
    const result = await updateRestrauntInfo(notionClient);
    expect(result).toBeTruthy();
  });
});