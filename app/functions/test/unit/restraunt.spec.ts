import {featchShishaPlaceId, featchShishaInfo, upLoadImage, postShishaShopInfo} from "../../src/restraunt";

// jest.mock("axios");
describe("Get shisha shop Info Test", () => {
  test("Get shisha shop place id", async () => {
    const shopName = "stay loose";
    const result = await featchShishaPlaceId(shopName);
    expect(result).toEqual("ChIJDb_3-H31GGARNYG5HNCnWEY");
  });

  test("Get shisha shop info", async () => {
    const placeId = "ChIJDb_3-H31GGARNYG5HNCnWEY";

    const result = await featchShishaInfo(placeId);
    const website = result.website;
    const googleMapUrl = result.googleMapUrl;
    expect(website).toEqual("https://www.instagram.com/stayloose_shisha/");
    expect(googleMapUrl).toEqual("https://maps.google.com/?cid=5068985892882448693");
    // TODO image test
  });

  // test("Get map jpg", async () => {
  //   const apikey = process.env.GOOGLE_MAP_APIKEY || "";
  //   const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=AZose0nZ6wocP4Dw512uPu2DpOjmx8hpUUmccvtGSJa6KmrySwctMxN5Pi9r1bPJIiX2JCAPE5-9rMsbuDVxeIH-w2r_ctS30xY75mFuLtZFK3JxqS-mzHHHwKHiY6iIu8KPsnkXiWmYYFV_ped1yBnGL7289EMr3mJpJ81tmmw2vcFFGFpD&key=${apikey}`;

  //   const result = await featchJpg(url);
  //   expect(result).to
  // });
});

describe("Upload Image", () => {
  test("post jpg image", async () => {
    const testFilePath = "test/images/test.jpg";
    const testImageArrayBuffer = Uint8Array.of(100,200,300,400);;
    const result = await upLoadImage(testFilePath, testImageArrayBuffer);
    expect(result).toContain("https");
  });
});

describe("Add shisha shop Info Test", () => {
  test("post shisha shop info", () => {
    const result = postShishaShopInfo();
    expect(result).toBeTruthy();
  });
});