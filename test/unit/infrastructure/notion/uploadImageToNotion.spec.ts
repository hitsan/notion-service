import { Client } from "@notionhq/client";
import { uploadImageToNotion } from "../../../../src/infrastructure/notion/uploadImageToNotion";

const createClient = () => {
  const create = jest.fn().mockResolvedValue({ id: "fu-1" });
  const send = jest.fn().mockResolvedValue({});
  const client = { fileUploads: { create, send } } as unknown as Client;
  return { client, create, send };
};

describe("uploadImageToNotion", () => {
  afterEach(() => jest.restoreAllMocks());

  it("画像取得に失敗（!ok）したら undefined を返しアップロードしない", async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as Response);
    const { client, create } = createClient();

    const result = await uploadImageToNotion(client, "https://x/i.jpg", "f.jpg");

    expect(result).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });

  it("成功時はアップロード ID を返す", async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob([], { type: "image/jpeg" }),
    } as unknown as Response);
    const { client } = createClient();

    const result = await uploadImageToNotion(client, "https://x/i.jpg", "f.jpg");

    expect(result).toBe("fu-1");
  });
});
