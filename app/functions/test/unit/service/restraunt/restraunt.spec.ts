import {updateRestrauntInfo} from "../../../../src/service/restraunt/restraunt";
import {NotionHelper} from "../../../../src/helper/notion-client-helper";

NotionHelper.init(process.env.NOTION_TOKEN);
describe("Update shisha shop Info test", () => {
  test("update", async () => {
    const dbId = process.env.NOTION_RESTRAUNT_DATABSE_ID || "";
    const result = await updateRestrauntInfo(dbId);
    expect(result).toBeTruthy();
  });
});