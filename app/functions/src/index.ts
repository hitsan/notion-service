import axios from "axios";
import * as functions from "firebase-functions";
import {Client} from "@notionhq/client";
import {formatInTimeZone} from "date-fns-tz";

const JST = "Asia/Tokyo";

const weatherCodeToIcon = (weatherCode: string): string => {
  // TODO edit weather
  // const weather = "☀️🌧️☁️🌨️🌩️🌫️";
  const weatherNumber = Number(weatherCode);
  if (weatherNumber == 17 ||
    weatherNumber == 29 ||
    (weatherNumber >= 91 && weatherNumber <= 99)) {
    return "🌩️";
  } else if (weatherNumber >= 0 && weatherNumber <= 3) {
    return "☀️";
  } else if (weatherNumber >= 4 && weatherNumber <= 29) {
    return "🌫️";
  } else if (weatherNumber >= 60 && weatherNumber <= 69) {
    return "🌧️";
  }
  return "";
};

const featchWeatherInfo = async (date: string) => {
  const timeZone = ["朝", "昼", "夕"];
  const url = `https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
  try {
    const responseWheather = await axios.get(url);
    const weatherItems = JSON.parse(JSON.stringify(responseWheather.data));
    let weatherInfo = "";
    let j = 0;
    const times = [9, 12, 18];

    times.forEach((time) => {
      const weatherCode = weatherItems.hourly.weathercode[time];
      const weatherIcon = weatherCodeToIcon(weatherCode);
      const temp = weatherItems.hourly.temperature_2m[time];
      weatherInfo += `${timeZone[j]}${weatherIcon}${temp}℃ `;
      j++;
    });

    return weatherInfo;
  } catch (error) {
    functions.logger.info("Faile getting the weather", {structuredData: true});
    return "";
  }
};

const postWeatherInfo = (date:string, wheatherInfo: string) => {
  const notion = new Client({auth: process.env.NOTION_TOKEN});
  const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID || "";
  const title = formatInTimeZone(new Date(), JST, "yyyy/MM/dd");

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
    functions.logger.info("Success! Entry added.", {structuredData: true});
  } catch (error) {
    functions.logger.info("Faile posting the weather", {structuredData: true});
  }
};

export const helloWorld = functions.https.onRequest(
  async (request, response) => {
    const date = formatInTimeZone(new Date(), JST, "yyyy-MM-dd");
    const watherInfo = await featchWeatherInfo(date);
    postWeatherInfo(date, watherInfo);
    response.send("Add a page to Life Log!");
  });

exports.scheduledFunctionCrontab = functions.pubsub.schedule("0 0 * * *")
  .timeZone(JST)
  .onRun(() => {
    functions.logger.info("Add a page to Life Log!", {structuredData: true});
  });
