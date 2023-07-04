import {updateRestrauntInfo} from "../../../../src/service/restraunt/restraunt";
import {NotionClientHelper} from "../../../../src/helper/notion-client-helper";

describe("Update shisha shop Info test", () => {
  const notionClient = new NotionClientHelper(process.env.NOTION_TOKEN);
  test("update", async () => {
    const dbId = process.env.NOTION_RESTRAUNT_DATABSE_ID || "";
    const result = await updateRestrauntInfo(notionClient, dbId);
    expect(result).toBeTruthy();
  });
});