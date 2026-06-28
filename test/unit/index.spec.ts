import { app } from "../../src/index";

describe("app routing", () => {
  it("不正な pageId は 400 を返す（認証通過後の入力検証）", async () => {
    const res = await app.request(
      "/books/too-short",
      { method: "POST", headers: { "X-Api-Secret": "s" } },
      { API_SECRET: "s" } as any,
    );
    expect(res.status).toBe(400);
  });

  it("認証ヘッダが無ければ 401（入力検証より前に弾く）", async () => {
    const res = await app.request(
      "/books/too-short",
      { method: "POST" },
      { API_SECRET: "s" } as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST /books は認証ヘッダが無ければ 401", async () => {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: "a".repeat(32) }),
      },
      { API_SECRET: "s" } as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST /books は body の pageId が不正なら 400", async () => {
    const res = await app.request(
      "/books",
      {
        method: "POST",
        headers: { "X-Api-Secret": "s", "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: "too-short" }),
      },
      { API_SECRET: "s" } as any,
    );
    expect(res.status).toBe(400);
  });

  it("POST /restaurants は認証ヘッダが無ければ 401", async () => {
    const res = await app.request(
      "/restaurants",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: "a".repeat(32) }),
      },
      { API_SECRET: "s" } as any,
    );
    expect(res.status).toBe(401);
  });

  it("POST /restaurants は body の pageId が不正なら 400", async () => {
    const res = await app.request(
      "/restaurants",
      {
        method: "POST",
        headers: { "X-Api-Secret": "s", "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: "too-short" }),
      },
      { API_SECRET: "s" } as any,
    );
    expect(res.status).toBe(400);
  });
});
