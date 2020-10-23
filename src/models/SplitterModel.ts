import fs from "fs";
import XmlSplit from "xmlsplit";

import { Settings } from "../declare/types";

class SplitterModel {
  settings: Settings;
  chunkNumber: number = 0;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  // fix start and end tags after splitting
  updateValue(data: string) {
    let updatedData = data
      .toString()
      .replace("</result>", `</${this.settings.tagName}s></result>`);

    if (this.chunkNumber > 0) {
      updatedData = updatedData.replace(
        "<result>",
        `<result><${this.settings.tagName}s>`
      );
    }

    return updatedData;
  }

  splitFile(
    inputStream: NodeJS.ReadableStream,
    outputStream: Function,
    callback: Function
  ) {
    this.chunkNumber = 0;

    const xmlsplit = new XmlSplit(
      this.settings.itemsPerChunk,
      this.settings.tagName
    );

    return new Promise((resolve, reject) => {
      xmlsplit.on("error", (err: string) => {
        if (err) {
          reject(new Error(err));
        }
      });
      inputStream.on("error", (err: string) => {
        if (err) {
          reject(new Error(err));
        }
      });

      inputStream
        .pipe(xmlsplit)
        .on("data", (data: any) => {
          outputStream(this.updateValue(data), this.chunkNumber);
          this.chunkNumber += 1;
        })
        .on("end", () => {
          callback();
          resolve();
        });
    });
  }
}

export default SplitterModel;
