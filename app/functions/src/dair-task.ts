import {formatInTimeZone} from "date-fns-tz";
import {addPageToLifelog} from "./lifelog";
import {addPageToRoutine} from "./routine";

export const dairyTask = (jst: string) => {
  const date = formatInTimeZone(new Date(), jst, "yyyy-MM-dd");
  const title = formatInTimeZone(new Date(), jst, "yyyy/MM/dd");
  addPageToLifelog(title, date);
  addPageToRoutine(title, date);
};