type BookSearchResult = {
  title: string;
  author: string;
  publishedDate: Date;
  coverImageUrl: string;
};

export const createGoogleBooksApiClient = () => ({
  async search(title: string): Promise<BookSearchResult> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);
    const data = await res.json() as any;
    const items = data.items;
    if (!items || items.length === 0) {
      throw new Error(`Google Books: no results for "${title}"`);
    }
    const info = items[0].volumeInfo;
    const ids = info.industryIdentifiers as { identifier: string }[] | undefined;
    if (!ids || ids.length === 0) {
      throw new Error(`Google Books: no ISBN for "${title}"`);
    }
    const isbn = ids.at(-1)!.identifier;
    return {
      title: info.title,
      author: ((info.authors as string[] | undefined) ?? []).join(", "),
      publishedDate: new Date(info.publishedDate),
      coverImageUrl: `https://cover.openbd.jp/${isbn}.jpg`,
    };
  },
});

export type GoogleBooksApiClient = ReturnType<typeof createGoogleBooksApiClient>;
