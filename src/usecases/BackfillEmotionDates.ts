import { IEmotionRepository } from "../domain/repositories/IEmotionRepository";

export const createBackfillEmotionDates = (emotionRepo: IEmotionRepository) => ({
  execute: async (): Promise<void> => {
    const targets = await emotionRepo.findEmotionsWithoutDate();
    await Promise.all(
      targets.map(async (target) => {
        const date = await emotionRepo.findLifelogDate(target.lifelogPageId);
        if (date === undefined) return;
        await emotionRepo.updateDate(target.pageId, date);
      }),
    );
  },
});
