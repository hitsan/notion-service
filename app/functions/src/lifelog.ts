// import axios from "axios";
import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";

// const weatherCodeToIcon = (weatherCode: string): string => {
//   // TODO edit weather
//   // const weather = "☀️🌧️☁️🌨️🌩️🌫️";
//   const weatherNumber = Number(weatherCode);
//   if (weatherNumber == 17 ||
//     weatherNumber == 29 ||
//     (weatherNumber >= 91 && weatherNumber <= 99)) {
//     return "🌩️";
//   } else if (weatherNumber >= 0 && weatherNumber <= 3) {
//     return "☀️";
//   } else if (weatherNumber >= 4 && weatherNumber <= 29) {
//     return "🌫️";
//   } else if (weatherNumber >= 60 && weatherNumber <= 69) {
//     return "🌧️";
//   }
//   return "";
// };

// const featchWeatherInfo = async (date: string) => {
//   const url = `https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
//   try {
//     const responseWheather = await axios.get(url);
//     const weatherItems = JSON.parse(JSON.stringify(responseWheather.data));
//     let weatherInfo = "";
//     const timeZone:{[timeFrame:string]: number} = {"朝":9, "昼":12, "夜":18};
//     const timeframes = Object.keys(timeZone);

//     timeframes.forEach((timeframe) => {
//       const time = timeZone[timeframe];
//       const weatherCode = weatherItems.hourly.weathercode[time];
//       const weatherIcon = weatherCodeToIcon(weatherCode);
//       const temp = weatherItems.hourly.temperature_2m[time];
//       weatherInfo += `${timeframe}${weatherIcon}${temp}℃ `;
//     });

//     return weatherInfo;
//   } catch (error) {
//     functions.logger.info("Failed getting the weather", {structuredData: true});
//     return "dd";
//   }
// };

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
  // const watherInfo = await featchWeatherInfo(date);
  // postWeatherInfo(date, title, watherInfo);
  postWeatherInfo(date, title, "watherInfo");
};
