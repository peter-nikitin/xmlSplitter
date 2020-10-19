import fs from "fs";
import XmlSplit from "xmlsplit";
import async from "async";
import db from "../db";

import { Settings } from "../declare/types.d";

class SplitController {
  batchSize: number;
  tagName: string;
  settings: Settings;
  files: string[];
  savingErrors: string[];
  chunckNumber: number = 0;

  constructor(settings: Settings) {
    this.batchSize = settings.itemsPerChunk;
    this.tagName = settings.tagName;
    this.settings = settings;
    this.splitFile = this.splitFile.bind(this);
    this.savingErrors = [];
  }

  splitFile(
    inputStream: NodeJS.ReadableStream,
    outputStream: Function,
    collback: Function
  ) {
    this.chunckNumber = 0;

    const xmlsplit = new XmlSplit(this.batchSize, this.tagName);

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
          let xmlDocument = data
            .toString()
            .replace("</result>", `</${this.tagName}s></result>`);
          if (this.chunckNumber > 0) {
            xmlDocument = xmlDocument.replace(
              "<result>",
              `<result><${this.tagName}s>`
            );
          }
          outputStream(xmlDocument, this.chunckNumber);
          this.chunckNumber += 1;
        })
        .on("end", () => {
          db.saveLogs(this.settings.operationName, {
            operation: this.settings.operationName,
            date: new Date(),
            data: `✂️  Поделили файлик на ${this.chunckNumber} кусков. `,
          });
          collback();
          resolve();
        });
    });
  }
}

export default SplitController;
