import axios from 'axios';
import * as functions from 'firebase-functions';
import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID || "";

type Info = {
  weather: string;
  minTemps: string;
  maxTemps: string;
};

export const helloWorld = functions.https.onRequest(async (request, response) => {
  const featchWeatherInfo = async () => {
    const url = 'https://www.jma.go.jp/bosai/forecast/data/forecast/';
    const area = '140000';
    try {
      const responseWheather = await axios.get(`${url}${area}.json`);
      functions.logger.info('Success getting the weather data!', {structuredData: true});

      const eastWeatherData = responseWheather.data[0].timeSeries[0].areas[0].weathers[1];
      const eastTemparatureData = responseWheather.data[0].timeSeries[2].areas[0];
      const minTemp = eastTemparatureData.temps[2];
      const maxTemp = eastTemparatureData.temps[3];

      const weatherInfo: Info = {
        weather: eastWeatherData,
        minTemps: minTemp,
        maxTemps: maxTemp,
      }

      return weatherInfo;
    } catch (error) {
      functions.logger.info('Faile getting the weather data!', {structuredData: true});
      return {
        weather: "",
        minTemps: "",
        maxTemps: "",
      }
    }
  };

  const postWeatherInfo = (wheatherInfo: Info) => {
    try {
      notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Date: {
            date: {
              start: '2023-04-10',
              end: null,
              time_zone: null
            }
          },
          Logs: {
            title:[
              {
                text: {
                  content: wheatherInfo.weather
                }
              }
            ]
          }
        },
      })
      functions.logger.info('Success! Entry added.', {structuredData: true});
    } catch (error) {
      functions.logger.info('Faile posting the weather data!', {structuredData: true});
    }
  }

  const watherInfo = await featchWeatherInfo();
  postWeatherInfo(watherInfo);
  response.send("add page");
});
