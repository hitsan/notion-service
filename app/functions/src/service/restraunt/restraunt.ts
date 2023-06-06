import * as functions from "firebase-functions";
import {initializeApp} from "firebase/app";
import {ref, getStorage, uploadBytes, getDownloadURL} from "firebase/storage";
import {ImageUrl} from "../utils/imageUrl";
import axios from "axios";
import {Client} from "@notionhq/client";
import {NotionHelper} from "../../../src/helper/notion-helper";

export interface recieverRestrauntInfo {
  website: string,
  googleMapUrl: string,
  imageRefUrl: string,
}

export interface SenderRestrauntInfo {
  website: string,
  googleMapUrl: string,
  imageUrl: ImageUrl,
}

interface TargetRestraunt {
  id: string,
  name: string,
}

export const featchRestrauntInfo = async (shopName: string): Promise<recieverRestrauntInfo> => {
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
    const apikey = process.env.GOOGLE_MAP_APIKEY || "";
    const imageRefUrl = "https://maps.googleapis.com/maps/api/place/photo?" +
    `maxwidth=400&photo_reference=${image}&key=${apikey}`;

    return {website, googleMapUrl, imageRefUrl};
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const uploadImage = async (imageName: string, imageUrl: string): Promise<ImageUrl> => {
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
    return new ImageUrl(downloadUrl);
  } catch (error) {
    functions.logger.error("Failed upload image", {structuredData: true});
    throw error;
  }
};

const featchTargetRestraunts = async (notion: Client, restrauntDBId: string):Promise<TargetRestraunt[]> => {
  const query = {
    property: "GoogleMap",
    url: {
      is_empty: true,
    }
  }
  try {
    const shopList = await NotionHelper.featchPageIds(restrauntDBId, query);
    return shopList;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const postRestrauntnfo = async (notion: Client, pageId: string, restrauntInfo: SenderRestrauntInfo) => {
  // TODO
  // notion api cannot update string that length over 100.
  // use dummy string.
  const website = restrauntInfo.website;
  const googleMapUrl = restrauntInfo.googleMapUrl;
  const imageUrl = restrauntInfo.imageUrl.toString();
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
          url: googleMapUrl,
        },
        URL: {
          url: website,
        },
      },
    });
    return (!!response);
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const updateRestrauntInfo = async (notion: Client, restrauntDBId: string) => {
  try {
    const shopList = await featchTargetRestraunts(notion, restrauntDBId);
    await Promise.all(shopList.map(
      async (shop) => {
        const shopInfo = await featchRestrauntInfo(shop.name);
        const imageUrl = await uploadImage(shop.name, shopInfo.imageRefUrl);
        const googleMapUrl = shopInfo.googleMapUrl;
        const website = shopInfo.website;
        const senderRestrauntInfo: SenderRestrauntInfo = {website, googleMapUrl, imageUrl};
        postRestrauntnfo(notion, shop.id, senderRestrauntInfo);
      }
    ));
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
