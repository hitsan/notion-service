import * as functions from "firebase-functions";
import axios from "axios";

const featchBookInfo = async (title: string) => {
    try {
      const getIsbn = async (title: string) => {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${title}`;
        const googleBookdata = await axios.get(url);
        functions.logger.info(googleBookdata, {structuredData: true});
        // auther, pubsh, image
        const bookData = JSON.parse(JSON.stringify(googleBookdata.data));
        // titleを確認してISBNを返す。
        const isbn = data.items[0].industryIdentifiers.identifier[1];

      }
    //   const isbn = bookData.items[0].industryIdentifiers.identifier[1];
    //   const bookTitle = titleData.volumeInfo.title;
    //   const 
      return ""
    } catch (error) {
      functions.logger.info("Failed getting the book info", {structuredData: true});
      return "";
    }
  };

export const notionDairy = functions.region("asia-northeast1").https.onRequest(
    (request, response) => {
      const title = "文豪たちの悪口本";
      featchBookInfo(title);
      response.send("Get book info");
    });