type RestaurantSearchResult = {
  googleMapUrl: string;
  imageRefUrl: string;
  websiteUrl?: string;
};

export const createGoogleMapsApiClient = (apiKey: string) => ({
  async search(shopName: string): Promise<RestaurantSearchResult> {
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(shopName)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`Google Maps Text Search error: ${searchRes.status}`);
    const searchData = await searchRes.json() as any;
    const placeId = searchData.results[0].place_id;

    const detailUrl =
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    const detailRes = await fetch(detailUrl);
    if (!detailRes.ok) throw new Error(`Google Maps Place Details error: ${detailRes.status}`);
    const detailData = await detailRes.json() as any;
    const result = detailData.result;

    const photoRef = result.photos[0].photo_reference;
    const imageRefUrl =
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;

    return {
      googleMapUrl: result.url,
      imageRefUrl,
      websiteUrl: result.website,
    };
  },
});

export type GoogleMapsApiClient = ReturnType<typeof createGoogleMapsApiClient>;
