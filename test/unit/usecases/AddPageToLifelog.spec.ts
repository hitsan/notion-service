import { createAddPageToLifelog } from "../../../src/usecases/AddPageToLifelog";
import { ILifelogRepository } from "../../../src/domain/repositories/ILifelogRepository";
import { OpenMeteoApiClient } from "../../../src/infrastructure/api/OpenMeteoApiClient";

const mockLifelogRepo: ILifelogRepository = {
  createLifelog: jest.fn().mockResolvedValue(undefined),
};

const mockWeatherApiClient: OpenMeteoApiClient = {
  fetchWeatherInfo: jest.fn().mockResolvedValue("☀️25🌧️20"),
};

describe("AddPageToLifelog", () => {
  it("天気情報を取得して Notion にライフログを作成する", async () => {
    const usecase = createAddPageToLifelog(mockLifelogRepo, mockWeatherApiClient);
    await usecase.execute();

    expect(mockWeatherApiClient.fetchWeatherInfo).toHaveBeenCalled();
    expect(mockLifelogRepo.createLifelog).toHaveBeenCalledWith(
      expect.objectContaining({ weatherInfo: "☀️25🌧️20" }),
    );
  });

  it("JST の日付で天気を取得する（UTC 夜は JST 翌日）", async () => {
    // 2026-06-25T21:30Z は JST 2026-06-26 06:30（cron 実行時刻に相当）
    const fixedNow = new Date("2026-06-25T21:30:00Z");
    const usecase = createAddPageToLifelog(
      mockLifelogRepo,
      mockWeatherApiClient,
      () => fixedNow,
    );
    await usecase.execute();

    expect(mockWeatherApiClient.fetchWeatherInfo).toHaveBeenLastCalledWith("2026-06-26");
  });
});
