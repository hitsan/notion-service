import axios from "axios";
import {NotionHelper} from "../../src/helper/notion-helper";
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

    const noonTime = 13;
    const eveningTime = 19;

    const hourlyInfo = weatherItems.hourly;
    const weatherNoonIcon = weatherCodeToIcon(hourlyInfo.weathercode[noonTime]);
    const weatherEveningIcon = weatherCodeToIcon(hourlyInfo.weathercode[eveningTime]);
    const roundNoonTemperature = Math.round(hourlyInfo.temperature_2m[noonTime]);
    const roundEveningTemperature = Math.round(hourlyInfo.temperature_2m[eveningTime]);
    return `${weatherNoonIcon}${roundNoonTemperature}${weatherEveningIcon}${roundEveningTemperature}`;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

const postLigeLogPage = async (date: string, weatherInfo: string,
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
  try {
    return await NotionHelper.createPage(databaseId, icon, properties);
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};

export const addPageToLifelog = async (date: string, databaseId: string) => {
  try {
    const weatherInfo = await featchWeatherInfo(date);
    await postLigeLogPage(date, weatherInfo, databaseId);
    return true;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    throw error;
  }
};
