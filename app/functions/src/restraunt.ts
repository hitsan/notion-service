import * as functions from "firebase-functions";
import {initializeApp} from "firebase/app";
import {ref, getStorage, uploadBytes, getDownloadURL} from "firebase/storage";
import axios from "axios";
import {Client} from "@notionhq/client";

export interface ShopInfo {
  website?: string,
  sns?: string,
  googleMapUrl: string,
  image: string
}

export const featcPlaceId = async (shopName: string):Promise<string> => {
  const googleMapSearchUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?";
  const googleMapApiKey = process.env.GOOGLE_MAP_APIKEY;
  if (!googleMapApiKey) throw new Error("Do not find GOOGLE_MAP_APIKEY");
  const requestUrl = `${googleMapSearchUrl}query=${shopName}&key=${googleMapApiKey}`;
  try {
    const response = await axios.get(requestUrl);
    const placeId = response.data.results[0].place_id;
    return placeId;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const featchShopInfo = async (placeId: string): Promise<ShopInfo> => {
  const googleMapUrl = "https://maps.googleapis.com/maps/api/place/details/json?";
  const googleMapApiKey = process.env.GOOGLE_MAP_APIKEY;
  if (!googleMapApiKey) throw new Error("Do not find GOOGLE_MAP_APIKEY");
  const googlePlaceIdInfoUrl = `${googleMapUrl}place_id=${placeId}&key=${googleMapApiKey}`

  try {
    const response = await axios.get(googlePlaceIdInfoUrl);
    const result = response.data.result;
    const googleMapUrl = result.url;
    const website = result.website;
    const image = result.photos[0].photo_reference;

    return {website, googleMapUrl, image};  
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const featchJpg = async (url: string): Promise<ArrayBuffer> => {
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  return response.data;
};

export const upLoadImage = async (filePath:string, imageArray: ArrayBuffer): Promise<string> => {
  const storageBucket = process.env.FIRESTORAGE_BUCKET;
  const firebaseConfig = {
    storageBucket: storageBucket
  };

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const imageRef = ref(storage, filePath);

  try {
    const response = await uploadBytes(imageRef, imageArray)
    const firestrageUrl = response.ref.toString();
    const refarense = ref(storage, firestrageUrl);
    const downloadUrl = await getDownloadURL(refarense);
    functions.logger.info(downloadUrl, {structuredData: true});
    return downloadUrl;
  } catch (error) {
    functions.logger.error("Failed upload image", {structuredData: true});
    throw error;
  }
};

interface LackedShop {
  id: string,
  name: string,
}

export const featchLackedShopList = async ():Promise<LackedShop[]> => {
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

export const postShopInfo = async (pageId: string, mapUrl: string, shopUrl: string, image: string) => {
  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) throw new Error("Do not find NOTION_TOKEN");
  const notion = new Client({auth: notionToken});

  const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID;
  if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");

  const imageUrl = (image.length > 100) ? "https://aaaa.jpg" : image; 
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        Image: {
          files: [
            {
              name: imageUrl,
              external: {
                url: imageUrl,
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
    functions.logger.info(response, {structuredData: true});
    return (response.id) === "sss";
  } catch (error) {
    throw error;
  }
};

export const updateShopInfo = async () => {
  try {
    const shopList = await featchLackedShopList();
    await shopList.map(async (shop) => {
      const placeId = await featcPlaceId(shop.name);
      const shopInfo = await featchShopInfo(placeId);

      const imageRef = shopInfo.image;
      const apikey = process.env.GOOGLE_MAP_APIKEY || "";
      const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${imageRef}&key=${apikey}`;
      functions.logger.info(imageUrl, {structuredData: true});
      const imageArray = await featchJpg(imageUrl);
      const path = `test/images/${shop.name}.jpg`;
      const downloadUrl = await upLoadImage(path, imageArray);

      const shopUrl = shopInfo.website || "";
      await postShopInfo(shop.id, shopInfo.googleMapUrl, shopUrl, downloadUrl);
    });
    return true;
  } catch (error) {
    throw error;
  }
};
