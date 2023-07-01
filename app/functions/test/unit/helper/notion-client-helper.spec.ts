import {NotionHelper} from "../../../src/helper/notion-client-helper";

// Notion SDK don't throw error when using iligal property.
// So, this test don't check iligal property case.
// Iligal property is checked before using Notion SDK.
describe("Notion Helper featch test", () => {
  const id = process.env.TEST_FEATCH_DB_ID || "";
  const test1Id = process.env.FEATCH_PAGE_TEST1 || "";
  const test2Id = process.env.FEATCH_PAGE_TEST2 || "";
  const test3Id = process.env.FEATCH_PAGE_TEST3 || "";
  const test4Id = process.env.FEATCH_PAGE_TEST4 || "";

  // Select
  test("featch by Select Book", async () => {
    const properties = {
      property: "Select",
      select: {
        equals: "Book",
      },
    };
    const response = await NotionHelper.featchPageIdsFromDB(id, properties);
    const expectResult = expect.arrayContaining([
      {id: test1Id, title: "test1"},
      {id: test4Id, title: "test4"}
    ]);
    expect(response).toEqual(expectResult);
  });

  test("featch by Select Movie", async () => {
    const properties = {
      property: "Select",
      select: {
        equals: "Movie",
      },
    };
    const response = await NotionHelper.featchPageIdsFromDB(id, properties);
    const expectResult = expect.arrayContaining([
      {id: test2Id, title: "test2"}
    ]);
    expect(response).toEqual(expectResult);
  });

  test("featch by Select Web", async () => {
    const properties = {
      property: "Select",
      select: {
        equals: "Web",
      },
    };
    const response = await NotionHelper.featchPageIdsFromDB(id, properties);
    const expectResult = expect.arrayContaining([
      {id: test3Id, title: "test3"}
    ]);
    expect(response).toEqual(expectResult);
  });

  test("featch by Select Movie and Web", async () => {
    const properties = {
      or: [
        {
          property: "Select",
          select: {
            equals: "Movie",
          },
        },
        {
          property: "Select",
          select: {
            equals: "Web",
          },
        }
      ]
    };
    const response = await NotionHelper.featchPageIdsFromDB(id, properties);
    const expectResult = expect.arrayContaining([
      {id: test2Id, title: "test2"},
      {id: test3Id, title: "test3"}
    ]);
    expect(response).toEqual(expectResult);
  });

  test("featch nocase ", async () => {
    const properties = {
      property: "Select",
      select: {
        equals: "Paper",
      },
    };
    const response = await NotionHelper.featchPageIdsFromDB(id, properties);
    const expectResult = expect.arrayContaining([]);
    expect(response).toEqual(expectResult);
  });
});

describe("Notion Helper update test", () => {
  test("Update page properties", async () => {
    const pageId = process.env.TEST_UPDATE_DB_ID || "";
    const icon = {emoji: "📕"};
    const properties = {
      Name: {
        title: [
          {
            text: {
              content: "test",
            },
          },
        ],
      },
      Tags: {
        multi_select: [
          {
            name: "TypeScript"
          },
          {
            name: "Python"
          },
        ],
      },
    };
    const query = {page_id: pageId, icon: icon, properties: properties}
    const result = await NotionHelper.updatePageProperties(query);
    expect(result).toBeTruthy();
  });
});

describe("Notion Helper crate test", () => {
  test("Create page", async () => {
    const databaseId = process.env.TEST_CREATE_DB_ID || "";
    const icon = "📕";
    const properties = {
      Name: {
        title: [
          {
            text: {
              content: "create_test",
            },
          },
        ],
      },
      Tags: {
        multi_select: [
          {
            name: "TypeScript"
          },
          {
            name: "Python"
          },
        ],
      },
    };

    const result = await NotionHelper.createPage(databaseId, icon, properties);
    expect(result).toBeTruthy();    
  });
});
