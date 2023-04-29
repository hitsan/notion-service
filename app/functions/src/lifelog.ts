import axios from "axios";
import * as functions from "firebase-functions";
import {DairyTaskInfo} from "./dairy-task"

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
  let openewatherUrl = process.env.OPEN_WEATHER_URL;
  if (!openewatherUrl) {
    functions.logger.error("Do not find OPEN_WEATHER_URL", {structuredData: true});
    throw new Error("Do not find OPEN_WEATHER_URL");
  }
  openewatherUrl = openewatherUrl.replace(/_DATE_/g, date);
  try {
    const responseWheather = await axios.get(openewatherUrl);
    const weatherItems = JSON.parse(JSON.stringify(responseWheather.data));
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
    functions.logger.error("Failed get the weather info", {structuredData: true});
    throw new Error("Failed get the weather info");
  }
};

const postLigeLogPage = async (dairyTaskInfo: DairyTaskInfo, wheatherInfo: string) => {
  const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID;
  let timelineURL = process.env.GOOGLE_MAP_TIMELINE_URL;
  if (!(databaseId && timelineURL)) {
    let message = "Do not find:";
    if (!databaseId) message += "NOTION_LIFELOG_DATABASE_ID ";
    if (!timelineURL) message += "GOOGLE_MAP_TIMELINE_URL ";
    functions.logger.error(message, {structuredData: true});
    throw new Error(message);
  }

  const date = dairyTaskInfo.date;
  const title = dairyTaskInfo.title;
  const notion = dairyTaskInfo.notion;
  timelineURL = timelineURL.replace("_DATE_", date);
  try {
    notion.pages.create({
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
                content: wheatherInfo,
              },
            },
          ],
        },
        Timeline: {
          url: timelineURL,
        },
      },
    });
    functions.logger.info("Success! post lifelog page:" + title, {structuredData: true});
  } catch (error) {
    functions.logger.error("Failed!  post lifelog page:" + title, {structuredData: true});
    throw new Error("Failed!  post lifelog page:" + title);
  }
};

export const addPageToLifelog = async (dairyTaskInfo: DairyTaskInfo) => {
  try {
    const watherInfo = await featchWeatherInfo(dairyTaskInfo.date);
    postLigeLogPage(dairyTaskInfo, watherInfo);
  } catch (error) {
    functions.logger.error("Failed! added lifelog", {structuredData: true});
    throw new Error("Failed! added lifelog");
  }
};
