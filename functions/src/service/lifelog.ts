import axios from "axios";
import { ClientHelper } from "../helper/notion-client-helper";
import { formatInTimeZone } from "date-fns-tz";
import { timeZone } from "..";

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

const getIconAndTemp = (weatherItems: any, time: number): string => {
  const hourlyInfo = weatherItems.hourly;
  const icon = weatherCodeToIcon(hourlyInfo.weathercode[time]);
  const temperature = Math.round(hourlyInfo.temperature_2m[time]);
  return icon + temperature;
};

const featchWeatherInfo = async (date: string) => {
  const weatherUrl =
    "https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=" +
    `temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
  const responseWheather = await axios.get(weatherUrl);
  const weatherItems = responseWheather.data;
  const [noonInfo, eveningInfo] = [13, 19].map((time) =>
    getIconAndTemp(weatherItems, time),
  );
  return `${noonInfo}${eveningInfo}`;
};

const postLifeLogPage = async (
  notionClientHelper: ClientHelper,
  date: string,
  timelineUrl: string,
  weatherInfo: string,
) => {
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
  const databaseId = notionClientHelper.lifelogDabase;
  return await notionClientHelper.createPage(databaseId, icon, properties);
};

const getTimelineUrl = (date: string): string => {
  if (!process.env.GOOGLE_MAP_TIMELINE_URL)
    throw new Error("Not found GOOGLE_MAP_TIMELINE_URL");
  const timelineUrl = process.env.GOOGLE_MAP_TIMELINE_URL + date;
  return timelineUrl;
};

export const addPageToLifelog = async (notionClientHelper: ClientHelper) => {
  const date = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");
  const weatherInfo = await featchWeatherInfo(date);
  const timelineUrl = getTimelineUrl(date);
  return await postLifeLogPage(
    notionClientHelper,
    date,
    timelineUrl,
    weatherInfo,
  );
};
