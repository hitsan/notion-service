import axios from "axios";
import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";

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
  return "";
};

const featchWeatherInfo = async (date: string) => {
  const url = `https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
  try {
    const responseWheather = await axios.get(url);
    const weatherItems = JSON.parse(JSON.stringify(responseWheather.data));
    let weatherInfo = "";
    const timeframes: number[] = [9, 14, 19];

    timeframes.forEach((timeframe) => {
      const weatherCode = Number(weatherItems.hourly.weathercode[timeframe]);
      const weatherIcon = weatherCodeToIcon(weatherCode);
      const temp = weatherItems.hourly.temperature_2m[timeframe];
      const roundTemp = Math.floor(temp)
      weatherInfo += `${weatherIcon}${roundTemp}℃`;
    });

    return weatherInfo;
  } catch (error) {
    functions.logger.info("Failed getting the weather", {structuredData: true});
    return "";
  }
};

const postWeatherInfo = (date:string, title:string, wheatherInfo: string) => {
  const notion = new Client({auth: process.env.NOTION_TOKEN});
  const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID || "";

  const timelineURL = process.env.GOOGLE_MAP_TIMELINE_URL || "";
  const url = timelineURL.replace("_DATE_", date);

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
          url: url,
        },
      },
    });
    functions.logger.info("Success! added lifelog", {structuredData: true});
  } catch (error) {
    functions.logger.info("Failed! added lifelog", {structuredData: true});
  }
};

export const addPageToLifelog = async (title:string, date:string) => {
  const watherInfo = await featchWeatherInfo(date);
  postWeatherInfo(date, title, watherInfo);
};
