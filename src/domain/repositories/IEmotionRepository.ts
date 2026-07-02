import { PageId } from "../types";
import { EmotionToBackfill } from "../entities/Emotion";

export interface IEmotionRepository {
  findEmotionsWithoutDate(): Promise<EmotionToBackfill[]>;
  findLifelogDate(lifelogPageId: PageId): Promise<string | undefined>;
  updateDate(pageId: PageId, date: string): Promise<void>;
}
