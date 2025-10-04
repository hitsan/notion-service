import * as functions from "firebase-functions";
import { initializeApp } from "firebase/app";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageUrl } from "../utils/imageUrl";
import axios from "axios";
import { convertNotionData } from "../../helper/notion-data-helper";
import { ClientHelper } from "../../helper/notion-client-helper";

interface recieverRestrauntInfo {
  website: string;
  googleMapUrl: string;
  imageRefUrl: string;
}

interface SenderRestrauntInfo {
  website: string;
  googleMapUrl: string;
  imageUrl: ImageUrl;
}

export type RestrauntPageData = {
  pageId: string;
  googleMap: string;
  image: ImageUrl;
  url?: string;
};

export const isRestrauntPageData = (item: any): item is RestrauntPageData => {
  const typed = item as RestrauntPageData;
  if (
    "pageId" in typed &&
    "googleMap" in typed &&
    "image" in typed &&
    "url" in typed
  ) {
    return true;
  }
  return false;
};

const featchRestrauntInfo = async (
  shopName: string,
): Promise<recieverRestrauntInfo> => {
  // todo
  // move this function to google map APIs
  // (shopName: String) => (googleMapUrl, website, imageRefUrl)
  const apiKey = process.env.GOOGLE_MAP_APIKEY;
  if (!apiKey) throw new Error("Do not find GOOGLE_MAP_APIKEY");
  try {
    const mapSearchUrl =
      "https://maps.googleapis.com/maps/api/place/textsearch/json?";
    const requestUrl = `${mapSearchUrl}query=${shopName}&key=${apiKey}`;
    const searchedResponse = await axios.get(requestUrl);
    const placeId = searchedResponse.data.results[0].place_id;

    const mapPlaceUrl =
      "https://maps.googleapis.com/maps/api/place/details/json?";
    const placeIdInfoUrl = `${mapPlaceUrl}place_id=${placeId}&key=${apiKey}`;
    const placeResponse = await axios.get(placeIdInfoUrl);
    const result = placeResponse.data.result;
    const googleMapUrl = result.url;
    const website = result.website;
    const image = result.photos[0].photo_reference;
    const apikey = process.env.GOOGLE_MAP_APIKEY || "";
    const imageRefUrl =
      "https://maps.googleapis.com/maps/api/place/photo?" +
      `maxwidth=400&photo_reference=${image}&key=${apikey}`;

    return { website, googleMapUrl, imageRefUrl };
  } catch (error) {
    functions.logger.error(error, { structuredData: true });
    throw error;
  }
};

export const uploadImage = async (
  imageName: string,
  imageUrl: string,
): Promise<ImageUrl> => {
  // todo
  // move this function to cloud APIs
  // shoud make cloud interface
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
    const imageArray = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const response = await uploadBytes(imageRef, imageArray.data);
    const firestrageUrl = response.ref.toString();
    const refarense = ref(storage, firestrageUrl);
    const downloadUrl = await getDownloadURL(refarense);
    // TODO
    // Notion SDK cannot send URL that is length over 100 charactor.
    // So send dummy url.
    const url =
      downloadUrl.length > 100 ? "https://www.test/test.jpg" : downloadUrl;
    return new ImageUrl(url);
  } catch (error) {
    functions.logger.error("Failed upload image", { structuredData: true });
    throw error;
  }
};

const featchTargetRestraunts = async (
  notionClient: ClientHelper,
  restrauntDBId: string,
) => {
  const query = {
    property: "GoogleMap",
    url: {
      is_empty: true,
    },
  };
  try {
    const shopList = await notionClient.featchPageIdsFromDB(
      restrauntDBId,
      query,
    );
    return shopList;
  } catch (error) {
    functions.logger.error(error, { structuredData: true });
    throw error;
  }
};

const postRestrauntnfo = async (
  notionClient: ClientHelper,
  pageId: string,
  restrauntInfo: SenderRestrauntInfo,
) => {
  const properties: RestrauntPageData = {
    pageId: pageId,
    googleMap: restrauntInfo.googleMapUrl,
    image: restrauntInfo.imageUrl,
    url: restrauntInfo.website ? restrauntInfo.website : "empty",
  };
  const query = convertNotionData(properties);
  await notionClient.updatePageProperties(query);
};

export const updateRestrauntInfo = async (notionClient: ClientHelper) => {
  const restrauntDBId = notionClient.restrauntDBId;
  try {
    const shopList = await featchTargetRestraunts(notionClient, restrauntDBId);
    await Promise.all(
      shopList.map(async (shop) => {
        const shopInfo = await featchRestrauntInfo(shop.title);
        const imageUrl = await uploadImage(shop.title, shopInfo.imageRefUrl);
        const googleMapUrl = shopInfo.googleMapUrl;
        const website = shopInfo.website;
        const senderRestrauntInfo: SenderRestrauntInfo = {
          website,
          googleMapUrl,
          imageUrl,
        };
        await postRestrauntnfo(notionClient, shop.id, senderRestrauntInfo);
      }),
    );
    return true;
  } catch (error) {
    functions.logger.error(error, { structuredData: true });
    throw error;
  }
};
