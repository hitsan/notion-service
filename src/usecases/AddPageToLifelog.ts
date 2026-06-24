import { ILifelogRepository } from "../domain/repositories/ILifelogRepository";
import { OpenMeteoApiClient } from "../infrastructure/api/OpenMeteoApiClient";
import { Lifelog } from "../domain/entities/Lifelog";
import { formatInTimeZone } from "date-fns-tz";

const TIME_ZONE = "Asia/Tokyo";

export const createAddPageToLifelog = (
  lifelogRepo: ILifelogRepository,
  weatherApiClient: OpenMeteoApiClient,
  now: () => Date = () => new Date(),
) => ({
  execute: async (): Promise<void> => {
    const today = now();
    const weatherInfo = await weatherApiClient.fetchWeatherInfo(
      formatInTimeZone(today, TIME_ZONE, "yyyy-MM-dd"),
    );
    const lifelog: Lifelog = { date: today, weatherInfo };
    await lifelogRepo.createLifelog(lifelog);
  },
});
