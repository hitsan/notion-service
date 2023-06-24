import {updateRestrauntInfo} from "../../../../src/service/restraunt/restraunt";

describe("Update shisha shop Info test", () => {
  test("update", async () => {
    const dbId = process.env.NOTION_RESTRAUNT_DATABSE_ID || "";
    const result = await updateRestrauntInfo(dbId);
    expect(result).toBeTruthy();
  });
});