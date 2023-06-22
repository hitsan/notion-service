import {featchRestrauntInfo, updateRestrauntInfo} from "../../../../src/service/restraunt/restraunt";
import axios from "axios";

jest.mock("axios");
describe("Update shisha shop Info test", () => {
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

  test("update", () => {
    const dbId = process.env.NOTION_RESTRAUNT_DATABSE_ID || "";
    const result = updateRestrauntInfo(dbId);
    expect(result).toBeTruthy();
  });
});