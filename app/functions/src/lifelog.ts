import axios from "axios";
import {Client} from "@notionhq/client";
import * as functions from "firebase-functions";

const weatherCodeToIcon = (weatherCode: number): string => {
  // Weather Icon ☀️🌧️☁️❄️🌩️🌫️🌪️;
  if (weatherCode >= 0 && weatherCode <= 1) {
    return "☀️";
  } else if (weatherCode >= 2 && weatherCode <= 3) {
    return "☁️";
  } else if (weatherCode >= 4 && weatherCode <= 59) {
    return "🌫️";
  } else if (weatherCode >= 60 && weatherCode <= 69) {
    return "🌧️";
  } else if (weatherCode >= 70 && weatherCode <= 79) {
    return "❄️";
  } else if (weatherCode >= 80 && weatherCode <= 84) {
    return "🌧️";
  } else if (weatherCode >= 85 && weatherCode <= 94) {
    return "❄️";
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    return "🌩️";
  }
  functions.logger.error("Iligal weather code", {structuredData: true});
  throw new Error("Iligal weather code");
};

const featchWeatherInfo = async (date: string) => {
  let weatherUrl = "https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=" +
  "temperature_2m,weathercode&start_date=_DATE_&end_date=_DATE_&timezone=Asia%2FTokyo";
  weatherUrl = weatherUrl.replace(/_DATE_/g, date);
  try {
    const responseWheather = await axios.get(weatherUrl);
    const weatherItems = responseWheather.data;
    const timeframes: number[] = [9, 14, 19];

    const weatherInfoList = timeframes.map((timeframe) => {
      const weatherCode = Number(weatherItems.hourly.weathercode[timeframe]);
      const weatherIcon = weatherCodeToIcon(weatherCode);
      const temp = weatherItems.hourly.temperature_2m[timeframe];
      const roundTemp = Math.floor(temp);
      return `${weatherIcon}${roundTemp}℃`;
    });

    const weatherInfo = weatherInfoList.join("");
    return weatherInfo;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

const postLigeLogPage = async (date: string, weatherInfo: string,
  notion: Client, databaseId: string) => {
  const timelineUrl = process.env.GOOGLE_MAP_TIMELINE_URL + date;
  if (!databaseId) throw new Error("Not found GOOGLE_MAP_TIMELINE_URL");
  const title = date.replace(/-/g, "/");
  try {
    await notion.pages.create({
      parent: {database_id: databaseId},
      icon: {
        emoji: "🗓️",
      },
      properties: {
        Date: {
          date: {
            start: date,
            end: null,
            time_zone: null,
          },
        },
        Logs: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Weather: {
          rich_text: [
            {
              text: {
                content: weatherInfo,
              },
            },
          ],
        },
        Timeline: {
          url: timelineUrl,
        },
      },
    });
    functions.logger.info("Success! post lifelog page:" + title, {structuredData: true});
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const addPageToLifelog = async (date: string, notion: Client, databaseId: string) => {
  try {
    const weatherInfo = await featchWeatherInfo(date);
    await postLigeLogPage(date, weatherInfo, notion, databaseId);
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
