/**
 * The URL refarence image file(jpg, png)
 */
export class ImageUrl {
  private url: string;
  /**
   * @param {string} url Image file URL
   */
  constructor(url: string) {
    const imageUrl = new URL(url);
    const imageExtension = new RegExp(".jpg|.jpeg|.png", "g");
    const isImageFileUrl = imageExtension.test(imageUrl.pathname);
    if (!isImageFileUrl) throw new Error("Illigal image url!");
    this.url = url;
  }

  /**
   *  @return {string} Image file URL
   */
  toString(): string {
    return this.url;
  }
}
