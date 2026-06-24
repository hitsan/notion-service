import { createGoogleMapsApiClient } from "../../../../src/infrastructure/api/GoogleMapsApiClient";

const jsonRes = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body } as Response);

describe("GoogleMapsApiClient", () => {
  afterEach(() => jest.restoreAllMocks());

  it("検索→詳細を取得して RestaurantSearchResult に変換する", async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonRes({ results: [{ place_id: "pid" }] }))
      .mockResolvedValueOnce(
        jsonRes({
          result: {
            url: "https://maps.google.com/?cid=123",
            website: "https://example.com",
            photos: [{ photo_reference: "ref" }],
          },
        }),
      );

    const result = await createGoogleMapsApiClient("key").search("俺のフレンチ");
    expect(result.googleMapUrl).toBe("https://maps.google.com/?cid=123");
    expect(result.websiteUrl).toBe("https://example.com");
    expect(result.imageRefUrl).toContain("photo_reference=ref");
  });

  it("検索結果0件なら明確なエラーを投げる", async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce(jsonRes({ results: [] }));
    await expect(createGoogleMapsApiClient("key").search("xxxxx")).rejects.toThrow(
      /no results/i,
    );
  });

  it("写真が無ければ明確なエラーを投げる", async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonRes({ results: [{ place_id: "pid" }] }))
      .mockResolvedValueOnce(
        jsonRes({ result: { url: "https://maps.google.com/?cid=123" } }),
      );
    await expect(createGoogleMapsApiClient("key").search("店")).rejects.toThrow(
      /no photo/i,
    );
  });
});
