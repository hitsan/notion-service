import {featchRestrauntInfo, featchTargetRestraunts} from "../../src/restraunt/restraunt";
import {Client} from "@notionhq/client";
import axios from "axios";

jest.mock("axios");
describe("Update shisha shop Info test", () => {
  const notionToken = process.env.NOTION_TOKEN || "";
  const notion = new Client({auth: notionToken});
  const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID || "";

  test("Featch shop info from notion DB", async () => {
    const shopList = await featchTargetRestraunts(notion, restrauntDBId);
    shopList.forEach(shop => {
      switch(shop.name) {
        case "kannok":
          expect(shop.id).toEqual(process.env.TEST_KANNOK);
          return;
        case "stay loose":
          expect(shop.id).toEqual(process.env.TEST_STAY);
          return;
      }
    });
  });

  const testMapUrl = "https://maps.google.com/?cid=5068985892882448693";
  const testWebsite = "https://www.instagram.com/stayloose_shisha/";
  test("Get shisha shop info from google", async () => {
    const placeMockedData = {
      data: {
        results: [
          {
            place_id: "ChIJDb_3-H31GGARNYG5HNCnWEY"
          }
        ]
      }
    };
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(placeMockedData);
    const test_ref = "test_ref";
    const restrauntMockedData = {
      data: {
        result: {
          url: testMapUrl,
          website: testWebsite,
          photos: [
            {
              photo_reference: test_ref,
            }
          ]
        }
      }
    };
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(restrauntMockedData);

    const shopName = "stay loose";
    const result = await featchRestrauntInfo(shopName);
    const website = result.website;
    const googleMapUrl = result.googleMapUrl;
    const photoReference = result.imageRefUrl;
    expect(googleMapUrl).toEqual(testMapUrl);
    expect(website).toEqual(testWebsite);
    const apiKey = process.env.GOOGLE_MAP_APIKEY || "";
    const testImageRef = "https://maps.googleapis.com/maps/api/place/photo" + 
    `?maxwidth=400&photo_reference=${test_ref}&key=${apiKey}`
    expect(photoReference).toEqual(testImageRef)
  });
});