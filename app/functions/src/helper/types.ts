import { NotionClientHelper } from "../helper/notion-client-helper";

export type Result<T, E> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  constructor(readonly value: T) {}
  get(): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;
  constructor(readonly value: E) {}
  get(): E {
    return this.value;
  }
}

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time * 60 * 1000));
export const retry = async (
  f: (client: NotionClientHelper) => Promise<Result<boolean, string>>,
  notionClientHelper: NotionClientHelper,
  times: number,
  minuts: number,
) => {
  let time = times;
  while (time > 0) {
    const ok = await f(notionClientHelper);
    if (ok.isSuccess) break;
    await sleep(minuts);
    console.log(time);
    time--;
  }
};
