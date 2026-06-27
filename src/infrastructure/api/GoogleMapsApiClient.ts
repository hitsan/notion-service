import { z } from "zod";

const searchResultsSchema = z.array(z.object({ place_id: z.string() }));

const detailResultSchema = z.object({
  url: z.string(),
  website: z.string().optional(),
  photos: z.array(z.object({ photo_reference: z.string() })).optional(),
});

type RestaurantSearchResult = {
  googleMapUrl: string;
  imageRefUrl?: string;
  websiteUrl?: string;
};

export const createGoogleMapsApiClient = (apiKey: string) => ({
  async search(shopName: string): Promise<RestaurantSearchResult> {
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(shopName)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`Google Maps Text Search error: ${searchRes.status}`);
    const searchData = (await searchRes.json()) as any;
    const results = searchResultsSchema.parse(searchData.results ?? []);
    if (results.length === 0) {
      throw new Error(`Google Maps: no results for "${shopName}"`);
    }
    const placeId = results[0].place_id;

    const detailUrl =
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    const detailRes = await fetch(detailUrl);
    if (!detailRes.ok) throw new Error(`Google Maps Place Details error: ${detailRes.status}`);
    const detailData = (await detailRes.json()) as any;
    const result = detailResultSchema.parse(detailData.result);

    const photoRef = result.photos?.[0]?.photo_reference;
    const imageRefUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`
      : undefined;

    return {
      googleMapUrl: result.url,
      imageRefUrl,
      websiteUrl: result.website,
    };
  },
});

export type GoogleMapsApiClient = ReturnType<typeof createGoogleMapsApiClient>;
