import * as functions from "firebase-functions";
import {initializeApp} from "firebase/app";
import {ref, getStorage, uploadBytes, getDownloadURL} from "firebase/storage";
import {ImageUrl} from "../utils/imageUrl";
import axios from "axios";
import {NotionHelper} from "../../../src/helper/notion-client-helper";
import { convertNotionData } from "../../helper/notion-data-helper";

interface recieverRestrauntInfo {
  website: string,
  googleMapUrl: string,
  imageRefUrl: string,
}

interface SenderRestrauntInfo {
  website: string,
  googleMapUrl: string,
  imageUrl: ImageUrl,
}

export type RestrauntPageData = {
  pageId: string;
  icon: string;
  category: string;
  googleMap: string;
  image: ImageUrl;
  url: string;
};

export const isRestrauntPageData = (item: any): item is RestrauntPageData => {
  const typed = item as RestrauntPageData;
  if (("pageId" in typed) &&
  ("icon" in typed) &&
  ("name" in typed) &&
  ("category" in typed) &&
  ("googleMap" in typed) &&
  ("image" in typed) &&
  ("url" in typed)) {
    return true;
  }
  return false;
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

const featchTargetRestraunts = async (restrauntDBId: string) => {
  const query = {
    property: "GoogleMap",
    url: {
      is_empty: true,
    },
  };
  try {
    const shopList = await NotionHelper.featchPageIdsFromDB(restrauntDBId, query);
    return shopList;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const postRestrauntnfo = async (pageId: string, restrauntInfo: SenderRestrauntInfo) => {
  const properties: RestrauntPageData = {
    pageId: pageId,
    icon: "🍴",
    category: "Shisha",
    googleMap: restrauntInfo.googleMapUrl,
    image: restrauntInfo.imageUrl,
    url: restrauntInfo.website,
  };
  const query = convertNotionData(properties);
  try {
    await NotionHelper.updatePageProperties(query);
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const updateRestrauntInfo = async (restrauntDBId: string) => {
  try {
    const shopList = await featchTargetRestraunts(restrauntDBId);
    await Promise.all(shopList.map(
      async (shop) => {
        const shopInfo = await featchRestrauntInfo(shop.title);
        const imageUrl = await uploadImage(shop.title, shopInfo.imageRefUrl);
        const googleMapUrl = shopInfo.googleMapUrl;
        const website = shopInfo.website;
        const senderRestrauntInfo: SenderRestrauntInfo = {website, googleMapUrl, imageUrl};
        await postRestrauntnfo(shop.id, senderRestrauntInfo);
      }
    ));
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
