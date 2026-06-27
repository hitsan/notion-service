import { z } from "zod";

const volumeInfoSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()).optional(),
  publishedDate: z.string().optional(),
  industryIdentifiers: z
    .array(z.object({ type: z.string().optional(), identifier: z.string() }))
    .optional(),
});

type BookSearchResult = {
  title: string;
  author?: string;
  publishedDate?: Date;
  coverImageUrl: string;
};

export const createGoogleBooksApiClient = () => ({
  async search(title: string): Promise<BookSearchResult> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);
    const data = (await res.json()) as any;
    const items = data.items;
    if (!items || items.length === 0) {
      throw new Error(`Google Books: no results for "${title}"`);
    }
    const info = volumeInfoSchema.parse(items[0].volumeInfo);
    const ids = info.industryIdentifiers;
    if (!ids || ids.length === 0) {
      throw new Error(`Google Books: no ISBN for "${title}"`);
    }
    const isbn = (ids.find((i) => i.type === "ISBN_13") ?? ids.at(-1)!).identifier;
    const author = info.authors?.length ? info.authors.join(", ") : undefined;
    const parsedDate = info.publishedDate ? new Date(info.publishedDate) : undefined;
    const publishedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;
    return {
      title: info.title,
      author,
      publishedDate,
      coverImageUrl: `https://cover.openbd.jp/${isbn}.jpg`,
    };
  },
});

export type GoogleBooksApiClient = ReturnType<typeof createGoogleBooksApiClient>;
