import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";
import axios from "axios";
import * as fs from 'fs'
import {Buffer} from "buffer";

export const featchShishaPlaceId = async (shopName: string) => {
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

export interface ShopInfo {
  website: string,
  sns?: string,
  googleMapUrl: string,
  image: string
}

export const featchShishaInfo = async (placeId: string): Promise<ShopInfo> => {
  const googleMapUrl = "https://maps.googleapis.com/maps/api/place/details/json?";
  const googleMapApiKey = process.env.GOOGLE_MAP_APIKEY;
  if (!googleMapApiKey) throw new Error("Do not find GOOGLE_MAP_APIKEY");
  const googlePlaceIdInfoUrl = `${googleMapUrl}place_id=${placeId}&key=${googleMapApiKey}`

  // website,sns,googlemap,image
  // TODO station
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

export const featchJpg = async (url: string) => {
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  fs.writeFileSync(`./map.jpg`, Buffer.from(response.data), 'binary');
  return true;
};

export const postShishaShopInfo = async () => {
  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) throw new Error("Do not find NOTION_TOKEN");
  const notion = new Client({auth: notionToken});

  const restrauntDBId = process.env.NOTION_RESTRAUNT_DATABSE_ID;
  if (!restrauntDBId) throw new Error("Do not find NOTION_RESTRAUNT_DATABSE_ID");

  const pageId = ""; // add page id
  const image ="./map.jpg";
  notion.pages.update({
    page_id: pageId,
    properties: {
      Image: {
        files: [
          {
            name: image,
            external: {
              url: image
            },
          },
        ],
      },
    },
  });

  return true;
}