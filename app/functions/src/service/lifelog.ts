import axios from "axios";
import * as functions from "firebase-functions";
import {ClientHelper} from "../helper/notion-client-helper";

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
  throw new Error("Iligal weather code");
};

const featchWeatherInfo = async (date: string) => {
  let weatherUrl = "https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=" +
  "temperature_2m,weathercode&start_date=_DATE_&end_date=_DATE_&timezone=Asia%2FTokyo";
  weatherUrl = weatherUrl.replace(/_DATE_/g, date);
  const responseWheather = await axios.get(weatherUrl);
  const weatherItems = responseWheather.data;

  const noonTime = 13;
  const eveningTime = 19;

  const hourlyInfo = weatherItems.hourly;
  const weatherNoonIcon = weatherCodeToIcon(hourlyInfo.weathercode[noonTime]);
  const weatherEveningIcon = weatherCodeToIcon(hourlyInfo.weathercode[eveningTime]);
  const roundNoonTemperature = Math.round(hourlyInfo.temperature_2m[noonTime]);
  const roundEveningTemperature = Math.round(hourlyInfo.temperature_2m[eveningTime]);
  return `${weatherNoonIcon}${roundNoonTemperature}${weatherEveningIcon}${roundEveningTemperature}`;
};

const postLifeLogPage = async (notionClientHelper: ClientHelper, date: string, weatherInfo: string,
  databaseId: string) => {
  const timelineUrl = process.env.GOOGLE_MAP_TIMELINE_URL + date;
  if (!databaseId) throw new Error("Not found GOOGLE_MAP_TIMELINE_URL");
  const title = date.replace(/-/g, "/");
  const icon = "🗓️";
  const properties = {
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
  };
  return await notionClientHelper.createPage(databaseId, icon, properties);
};

export const addPageToLifelog = async (notionClientHelper: ClientHelper, date: string, databaseId: string) => {
  try {
    const weatherInfo = await featchWeatherInfo(date);
    const ok = await postLifeLogPage(notionClientHelper, date, weatherInfo, databaseId);
    return ok;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
