import {BookSearchQuery} from "../service/watchList/book-info"

type Query = {
  (query: BookSearchQuery): object;
};
  
export const convertNotionData: Query = (query: BookSearchQuery): object => {
  return {query};
}