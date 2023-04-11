import axios from 'axios';
import * as functions from 'firebase-functions';
import { Client } from "@notionhq/client"
import { format } from 'date-fns'

const weatherCodeToIcon = (weatherCode: string): string => {
  // TODO edit weather
  // const weather = '☀️🌧️☁️🌨️🌩️🌫️';
  const weatherNumber = Number(weatherCode);
  if (weatherNumber == 17 ||
    weatherNumber == 29 ||
    (weatherNumber >= 91 && weatherNumber <= 99)) {
      return '🌩️';
  } else if (weatherNumber >= 0 && weatherNumber <= 3) {
    return '☀️';
  } else if (weatherNumber >= 4 && weatherNumber <= 29) {
    return '🌫️'
  } else if (weatherNumber >= 60 && weatherNumber <= 69) {
    return '🌧️'
  }
  return ""
}

const featchWeatherInfo = async (date: string) => {
  const time = ['🕘','🕛','🕒','🕕','🕘'];
  const url = `https://api.open-meteo.com/v1/jma?latitude=35.69&longitude=139.69&hourly=temperature_2m,weathercode&start_date=${date}&end_date=${date}&timezone=Asia%2FTokyo`;
  try {
    const responseWheather = await axios.get(url);
    const weatherItems = JSON.parse(JSON.stringify(responseWheather.data));
    let weatherInfo: string = '';
    let j = 0;
    for (let i = 9; i <= 21; i+=3) {
      const weatherCode = weatherItems.hourly.weathercode[i];
      const weatherIcon = weatherCodeToIcon(weatherCode);
      const temp = weatherItems.hourly.temperature_2m[i]
      weatherInfo += `${time[j]}:${weatherIcon}${temp}℃ `;
      j++;
    }

    return weatherInfo;
  } catch (error) {
    functions.logger.info('Faile getting the weather data!', {structuredData: true});
    return '';
  }    
}

const postWeatherInfo = (date:string, wheatherInfo: string) => {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_LIFELOG_DATABASE_ID || "";  
  const title = format(new Date(), 'yyyy/MM/dd');

  const timelineURL = process.env.GOOGLE_MAP_TIMELINE_URL || '';
  const url = timelineURL.replace('_DATE_', date);

  try {
    notion.pages.create({
      parent: { database_id: databaseId },
      icon: {
        emoji: "🗓️"
      },
      properties: {
        Date: {
          date: {
            start: date,
            end: null,
            time_zone: null
          }
        },
        Logs: {
          title:[
            {
              text: {
                content: title
              }
            }
          ]
        },
        Weather: {
          rich_text: [
            {
              text: {
                content: wheatherInfo
              }
            }
          ]
        },
        Timeline: {
          url: url
        },
      },
    })
    functions.logger.info('Success! Entry added.', {structuredData: true});
  } catch (error) {
    functions.logger.info('Faile posting the weather data!', {structuredData: true});
  }
}

export const helloWorld = functions.https.onRequest(async (request, response) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  const watherInfo = await featchWeatherInfo(date);
  postWeatherInfo(date, watherInfo);
  response.send("Add a page to Life Log!");
});

exports.scheduledFunctionCrontab = functions.pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Tokyo') 
  .onRun((context) => {
    functions.logger.info('Add a page to Life Log!', {structuredData: true});
  });