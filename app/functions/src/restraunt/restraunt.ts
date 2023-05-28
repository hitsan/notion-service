import * as functions from "firebase-functions";
import {initializeApp} from "firebase/app";
import {ref, getStorage, uploadBytes, getDownloadURL} from "firebase/storage";
import {ImageUrl} from "../utils/imageUrl";
import axios from "axios";
import {Client} from "@notionhq/client";

export interface RestrauntInfo {
  website?: string,
  sns?: string,
  googleMapUrl: string,
  image: ImageUrl,
}

interface TargetRestraunt {
  id: string,
  name: string,
}

export const featchRestrauntInfo = async (shopName: string): Promise<RestrauntInfo> => {
  const apiKey = process.env.GOOGLE_MAP_APIKEY;
  if (!apiKey) throw new Error("Do not find GOOGLE_MAP_APIKEY");
  try {
    const mapSearchUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?";
    const requestUrl = `${mapSearchUrl}query=${shopName}&key=${apiKey}`;
    const searchedResponse = await axios.get(requestUrl);
    const placeId = searchedResponse.data.results[0].place_id;

    const mapPlaceUrl = "https://maps.googleapis.com/maps/api/place/details/json?";
    const placeIdInfoUrl = `${mapPlaceUrl}place_id=${placeId}&key=${apiKey}`;
    const placeResponse = await axios.get(placeIdInfoUrl);
    const result = placeResponse.data.result;
    const googleMapUrl = result.url;
    const website = result.website;
    const image = result.photos[0].photo_reference;

    return {website, googleMapUrl, image};
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const uploadImage = async (imageName: string, imageUrl: string): Promise<string> => {
  const storageBucket = process.env.FIRESTORAGE_BUCKET;
  if (!storageBucket) throw new Error("Do not find FIRESTORAGE_BUCKET");
  const firebaseConfig = {
    storageBucket: storageBucket,
  };
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const filePath = `test/images/${imageName}.jpg`;
  const imageRef = ref(storage, filePath);

  try {
    const imageArray = await axios.get(imageUrl, {responseType: "arraybuffer"});
    const response = await uploadBytes(imageRef, imageArray.data);
    const firestrageUrl = response.ref.toString();
    const refarense = ref(storage, firestrageUrl);
    const downloadUrl = await getDownloadURL(refarense);
    return downloadUrl;
  } catch (error) {
    functions.logger.error("Failed upload image", {structuredData: true});
    throw error;
  }
};

export const featchTargetRestraunts = async ():Promise<TargetRestraunt[]> => {
  try {
    const notionToken = process.env.NOTION_TOKEN;
    if (!notionToken) throw new Error("Do not find NOTION_TOKEN");
    const notion = new Client({auth: notionToken});
    const shopListId = process.env.NOTION_RESTRAUNT_DATABSE_ID || "";
    const response = await notion.databases.query({
      database_id: shopListId,
      filter: {
        property: "GoogleMap",
        url: {
          is_empty: true,
        },
      },
    });
    const shopList = response.results.map((result) => {
      if (!("properties" in result && "title" in result.properties.Name)) {
        throw new Error("Ilegal data");
      }
      const name = result.properties.Name.title[0].plain_text;
      return {id: result.id, name: name};
    });
    return shopList;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const postRestrauntnfo = async (pageId: string, mapUrl: string, shopUrl: string, imageUrl: string) => {
  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) throw new Error("Do not find NOTION_TOKEN");
  const notion = new Client({auth: notionToken});

  const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID;
  if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");

  // TODO
  // notion api cannot update string that length over 100.
  // use dummy string.
  const testimageUrl = (imageUrl.length > 100) ? "https://aaaa.jpg" : imageUrl;
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Image: {
          files: [
            {
              name: testimageUrl,
              external: {
                url: testimageUrl,
              },
            },
          ],
        },
        GoogleMap: {
          url: mapUrl,
        },
        URL: {
          url: shopUrl,
        },
      },
    });
    return (!!response);
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const updateRestrauntInfo = async () => {
  try {
    const shopList = await featchTargetRestraunts();
    await shopList.map(async (shop) => {
      const shopInfo = await featchRestrauntInfo(shop.name);

      const imageRef = shopInfo.image;
      const apikey = process.env.GOOGLE_MAP_APIKEY || "";
      const imageRefUrl = "https://maps.googleapis.com/maps/api/place/photo?" +
      `maxwidth=400&photo_reference=${imageRef}&key=${apikey}`;

      const imageUrl = await uploadImage(shop.name, imageRefUrl);
      const shopUrl = shopInfo.website || "";
      await postRestrauntnfo(shop.id, shopInfo.googleMapUrl, shopUrl, imageUrl);
    });
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
