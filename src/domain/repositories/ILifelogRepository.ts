import { Lifelog } from "../entities/Lifelog";

export interface ILifelogRepository {
  createLifelog(lifelog: Lifelog): Promise<void>;
}
