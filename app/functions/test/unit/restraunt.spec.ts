import {featchShopInfo, featchLackedShopList, updateShopInfo} from "../../src/restraunt";

// jest.mock("axios");
describe("Get shisha shop Info Test", () => {
  test("Get shisha shop info", async () => {
    const shopName = "stay loose";
    const result = await featchShopInfo(shopName);
    const website = result.website;
    const googleMapUrl = result.googleMapUrl;
    expect(website).toEqual("https://www.instagram.com/stayloose_shisha/");
    expect(googleMapUrl).toEqual("https://maps.google.com/?cid=5068985892882448693");
  });
});

describe("Featch shop info", () => {
  test("Featch shop info", async () => {
    const shopList = await featchLackedShopList();
    shopList.forEach(shop => {
      console.log(shop.name);
      switch(shop.name) {
        case "kannok":
          expect(shop.id).toEqual(process.env.SHISHA_KANNOK);
          return;
        case "stay loose":
          expect(shop.id).toEqual(process.env.SHISHA_STAY);
          return;
      }
    });
  });
});

describe("Update shisha shop Info test", () => {
  test("Update shisha shop info", async () => {
    const result = await updateShopInfo();
    expect(result).toBeTruthy();
  });
});