import { ILifelogRepository } from "../domain/repositories/ILifelogRepository";
import { OpenMeteoApiClient } from "../infrastructure/api/OpenMeteoApiClient";
import { Lifelog } from "../domain/entities/Lifelog";
import { format } from "date-fns";

export const createAddPageToLifelog = (
  lifelogRepo: ILifelogRepository,
  weatherApiClient: OpenMeteoApiClient,
) => ({
  execute: async (): Promise<void> => {
    const today = new Date();
    const weatherInfo = await weatherApiClient.fetchWeatherInfo(
      format(today, "yyyy-MM-dd"),
    );
    const lifelog: Lifelog = { date: today, weatherInfo };
    await lifelogRepo.createLifelog(lifelog);
  },
});
