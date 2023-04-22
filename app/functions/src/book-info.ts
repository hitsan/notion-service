import * as functions from "firebase-functions";
import axios from "axios";

export const featchBookInfo = async (title: string) => {

  const featchIsbn = async (title: string): Promise<string | Error> => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${title}`;
    try {
      const googleBookdata = await axios.get(url);
      const bookJsonData = JSON.parse(JSON.stringify(googleBookdata.data));
      const industryIdentifiers = bookJsonData.items[0].industryIdentifiers[0].identifier;
      // const isbn = industryIdentifiers[1].identifier;
      return industryIdentifiers;
    } catch (error: unknown) {
      functions.logger.info(error, {structuredData: true});
      return new Error();
    }
  };
  const fetchBookDescription = async (isbn: string) => {
    const url = `https://api.openbd.jp/v1/get?isbn=${isbn}`;
    try {
      const openDbBookdata = await axios.get(url);
      const bookJsonData = JSON.parse(JSON.stringify(openDbBookdata.data));
      const auther = bookJsonData.DescriptiveDetail.Contributor.PersonName;
      const imageUrl = bookJsonData.CollateralDetail.SupportingResource.ResourceLink;
      const publishingDate = bookJsonData.PublishingDetail.PublishingDate;
      const bookInfo = {"auther": auther, "imageUrl": imageUrl, "publishingDate": publishingDate};
      return bookInfo;
    } catch (error: unknown) {
      functions.logger.info(error, {structuredData: true});
      return new Error();
    }
  };
  try {
    const isbn = await featchIsbn(title);
    if (isbn instanceof Error) {
      functions.logger.info("Failed getting the book info from google", {structuredData: true});
      return "";
    }
    const bookInfo = await fetchBookDescription(isbn);
    return bookInfo;
  } catch (error) {
    functions.logger.info("Failed getting the book info", {structuredData: true});
    return new Error();
  }
};
