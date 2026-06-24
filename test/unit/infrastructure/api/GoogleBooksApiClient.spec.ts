import { createGoogleBooksApiClient } from "../../../../src/infrastructure/api/GoogleBooksApiClient";

const mockFetch = (body: unknown, ok = true, status = 200) =>
  jest.fn().mockResolvedValue({ ok, status, json: async () => body } as Response);

describe("GoogleBooksApiClient", () => {
  afterEach(() => jest.restoreAllMocks());

  it("検索結果を BookSearchResult に変換する", async () => {
    globalThis.fetch = mockFetch({
      items: [
        {
          volumeInfo: {
            title: "吾輩は猫である",
            authors: ["夏目 漱石"],
            publishedDate: "1905-01-01",
            industryIdentifiers: [{ type: "ISBN_13", identifier: "9784101010014" }],
          },
        },
      ],
    });

    const result = await createGoogleBooksApiClient().search("吾輩は猫である");
    expect(result).toEqual({
      title: "吾輩は猫である",
      author: "夏目 漱石",
      publishedDate: new Date("1905-01-01"),
      coverImageUrl: "https://cover.openbd.jp/9784101010014.jpg",
    });
  });

  it("ヒット0件なら明確なエラーを投げる", async () => {
    globalThis.fetch = mockFetch({ totalItems: 0, items: [] });
    await expect(createGoogleBooksApiClient().search("xxxxx")).rejects.toThrow(
      /no results/i,
    );
  });

  it("ISBN_10 と ISBN_13 が混在する場合は ISBN_13 を選ぶ", async () => {
    globalThis.fetch = mockFetch({
      items: [
        {
          volumeInfo: {
            title: "t",
            authors: ["a"],
            publishedDate: "2000",
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9784101010014" },
              { type: "ISBN_10", identifier: "4101010013" },
            ],
          },
        },
      ],
    });
    const result = await createGoogleBooksApiClient().search("t");
    expect(result.coverImageUrl).toBe("https://cover.openbd.jp/9784101010014.jpg");
  });

  it("ISBN が無ければ明確なエラーを投げる", async () => {
    globalThis.fetch = mockFetch({
      items: [{ volumeInfo: { title: "t", authors: ["a"], publishedDate: "2000" } }],
    });
    await expect(createGoogleBooksApiClient().search("t")).rejects.toThrow(/ISBN/i);
  });

  it("HTTP エラー時はステータスを含むエラーを投げる", async () => {
    globalThis.fetch = mockFetch({}, false, 503);
    await expect(createGoogleBooksApiClient().search("t")).rejects.toThrow(/503/);
  });
});
