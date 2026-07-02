import { createBackfillEmotionDates } from "../../src/usecases/BackfillEmotionDates";
import { IEmotionRepository } from "../../src/domain/repositories/IEmotionRepository";
import { EmotionToBackfill } from "../../src/domain/entities/Emotion";
import { PageId } from "../../src/domain/types";

const pageId = (c: string): PageId => c.repeat(32);

type Updated = { pageId: PageId; date: string }[];

const makeEmotionRepo = (
  targets: EmotionToBackfill[],
  lifelogDates: Record<string, string | undefined>,
) => {
  const updated: Updated = [];
  const repo: IEmotionRepository = {
    async findEmotionsWithoutDate() {
      return targets;
    },
    async findLifelogDate(lifelogPageId) {
      return lifelogDates[lifelogPageId];
    },
    async updateDate(pageId, date) {
      updated.push({ pageId, date });
    },
  };
  return { repo, updated };
};

describe("BackfillEmotionDates", () => {
  it("Date 空 emotion を relation 先 LifeLog の Date で更新する", async () => {
    const { repo, updated } = makeEmotionRepo(
      [{ pageId: pageId("b"), lifelogPageId: pageId("a") }],
      { [pageId("a")]: "2026-07-01" },
    );

    await createBackfillEmotionDates(repo).execute();

    expect(updated).toEqual([{ pageId: pageId("b"), date: "2026-07-01" }]);
  });

  it("複数の対象をそれぞれ対応する LifeLog の Date で更新する", async () => {
    const { repo, updated } = makeEmotionRepo(
      [
        { pageId: pageId("b"), lifelogPageId: pageId("a") },
        { pageId: pageId("d"), lifelogPageId: pageId("c") },
      ],
      { [pageId("a")]: "2026-07-01", [pageId("c")]: "2026-06-30" },
    );

    await createBackfillEmotionDates(repo).execute();

    expect(updated).toHaveLength(2);
    expect(updated).toEqual(
      expect.arrayContaining([
        { pageId: pageId("b"), date: "2026-07-01" },
        { pageId: pageId("d"), date: "2026-06-30" },
      ]),
    );
  });

  it("relation 先 LifeLog の Date が空ならスキップする", async () => {
    const { repo, updated } = makeEmotionRepo(
      [
        { pageId: pageId("b"), lifelogPageId: pageId("a") },
        { pageId: pageId("d"), lifelogPageId: pageId("c") },
      ],
      { [pageId("a")]: undefined, [pageId("c")]: "2026-06-30" },
    );

    await createBackfillEmotionDates(repo).execute();

    expect(updated).toEqual([{ pageId: pageId("d"), date: "2026-06-30" }]);
  });

  it("対象が 0 件なら何もしない", async () => {
    const { repo, updated } = makeEmotionRepo([], {});

    await createBackfillEmotionDates(repo).execute();

    expect(updated).toEqual([]);
  });
});
