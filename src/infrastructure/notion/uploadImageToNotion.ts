import { Client } from "@notionhq/client";

export const uploadImageToNotion = async (
  client: Client,
  imageUrl: string,
  filename: string,
): Promise<string | undefined> => {
  const res = await fetch(imageUrl);
  if (!res.ok) return undefined;
  const blob = await res.blob();

  const upload = await client.fileUploads.create({
    mode: "single_part",
    filename,
    content_type: blob.type,
  });

  await client.fileUploads.send({
    file_upload_id: upload.id,
    file: { filename, data: blob },
  });

  return upload.id;
};
