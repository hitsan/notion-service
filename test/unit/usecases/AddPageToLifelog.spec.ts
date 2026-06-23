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
});
