import { createUpdateBookInfo } from "../../../src/usecases/UpdateBookInfo";
import { IBookRepository } from "../../../src/domain/repositories/IBookRepository";
import { GoogleBooksApiClient } from "../../../src/infrastructure/api/GoogleBooksApiClient";
import { BookRecord } from "../../../src/domain/entities/Book";

const pageId = "a".repeat(32) as ReturnType<typeof String>;

const mockRecord: BookRecord = {
  kind: "BookRecord",
  pageId: pageId as any,
  name: "吾輩は猫である",
};

const mockBookRepo: IBookRepository = {
  findBook: jest.fn().mockResolvedValue(mockRecord),
  updateBook: jest.fn().mockResolvedValue(undefined),
};

const mockBooksApiClient: GoogleBooksApiClient = {
  search: jest.fn().mockResolvedValue({
    title: "吾輩は猫である",
    author: "夏目 漱石",
    publishedDate: new Date("1905-01-01"),
    coverImageUrl: "https://cover.openbd.jp/9784101010014.jpg",
  }),
};

describe("UpdateBookInfo", () => {
  it("本の情報を取得して Notion を更新する", async () => {
    const usecase = createUpdateBookInfo(mockBookRepo, mockBooksApiClient);
    await usecase.execute(mockRecord.pageId);

    expect(mockBookRepo.findBook).toHaveBeenCalledWith(mockRecord.pageId);
    expect(mockBooksApiClient.search).toHaveBeenCalledWith("吾輩は猫である");
    expect(mockBookRepo.updateBook).toHaveBeenCalledWith(
      mockRecord.pageId,
      expect.objectContaining({
        kind: "Book",
        name: "吾輩は猫である",
        author: "夏目 漱石",
      }),
    );
  });
});
