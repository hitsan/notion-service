import axios from 'axios';
import * as functions from "firebase-functions";

const url = "https://www.jma.go.jp/bosai/forecast/data/forecast/";
const area = "140000";

export const helloWorld = functions.https.onRequest(async (request, response) => {
  // functions.logger.info("Hello logs!", {structuredData: true});

  const wather = async () => {
    try {
      const response = await axios.get(`${url}${area}.json`);
      const eastWeatherData = response.data[0].timeSeries[0].areas[0].weathers[1];
      const eastTemparatureData = response.data[0].timeSeries[2].areas[0];

      const minTemp = eastTemparatureData.temps[2];
      const maxTemp = eastTemparatureData.temps[3];

      return eastWeatherData + ", " + minTemp + ", " + maxTemp;
    } catch (error) {
      return "no data"
    }
  };

  const retVal = await wather();
  response.send(retVal);

});
