import { ZodError } from "zod";
import { onError } from "../../../src/middleware/onError";

const fakeContext = () => {
  const captured: { body?: unknown; status?: number } = {};
  const c = {
    json: (body: unknown, status: number) => {
      captured.body = body;
      captured.status = status;
      return captured;
    },
  };
  return { c: c as any, captured };
};

describe("onError", () => {
  afterEach(() => jest.restoreAllMocks());

  it("ZodError は 400 を返す", () => {
    const { c, captured } = fakeContext();
    const err = new ZodError([]);
    onError(err, c);
    expect(captured.status).toBe(400);
  });

  it("その他の例外は 500 を返す", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { c, captured } = fakeContext();
    onError(new Error("upstream failed"), c);
    expect(captured.status).toBe(500);
  });
});
