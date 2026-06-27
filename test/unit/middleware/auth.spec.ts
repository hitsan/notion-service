import { Hono } from "hono";
import { apiSecretAuth } from "../../../src/middleware/auth";

type Bindings = { API_SECRET: string };

const buildApp = () => {
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("/protected", apiSecretAuth);
  app.get("/protected", (c) => c.text("ok"));
  return app;
};

describe("apiSecretAuth", () => {
  it("ヘッダが一致すれば通過する", async () => {
    const res = await buildApp().request(
      "/protected",
      { headers: { "X-Api-Secret": "s3cret" } },
      { API_SECRET: "s3cret" },
    );
    expect(res.status).toBe(200);
  });

  it("ヘッダが一致しなければ 401", async () => {
    const res = await buildApp().request(
      "/protected",
      { headers: { "X-Api-Secret": "wrong" } },
      { API_SECRET: "s3cret" },
    );
    expect(res.status).toBe(401);
  });

  it("ヘッダが無ければ 401", async () => {
    const res = await buildApp().request("/protected", {}, { API_SECRET: "s3cret" });
    expect(res.status).toBe(401);
  });

  it("シークレット未設定なら 401（フォールバックで通さない）", async () => {
    const res = await buildApp().request(
      "/protected",
      { headers: { "X-Api-Secret": "" } },
      { API_SECRET: "" },
    );
    expect(res.status).toBe(401);
  });
});
