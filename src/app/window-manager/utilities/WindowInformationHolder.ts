import { Bounds } from "./Bounds";

export class WindowInformationHolder {
  public bounds: Bounds;
  public url: string;
  public id: number;
  public favicon: string;
  public pageName: string;

  constructor(bounds: Bounds, url: string, id: number) {
    this.bounds = bounds;
    this.url = url;
    this.id = id;
    this.favicon =
      "https://www.google.com/s2/favicons?sz=64&domain_url=" + this.url;
    this.pageName = this.url.replace("https://www.", "");
    let position = this.pageName.lastIndexOf(".");
    this.pageName = this.pageName.substring(0, position);
  }
}
