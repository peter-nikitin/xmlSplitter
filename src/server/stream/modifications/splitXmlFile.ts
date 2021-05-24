import fs from "fs";
import XmlSplit from "xmlsplit";

import { Settings } from "src/@types";

// fix start and end tags after splitting
export const replaceResultTag = (
  data: string,
  tagName: string,
  chunkNumber: number
) => {
  let updatedData = data
    .toString()
    .replace("</result>", `</${tagName}s></result>`);

  if (chunkNumber > 0) {
    updatedData = updatedData.replace("<result>", `<result><${tagName}s>`);
  }
  return updatedData;
};

const splitXmlFile = (
  inputStream: NodeJS.ReadableStream,
  outputStream: (data: any, chunkNumber: number) => void,
  settings: Settings
): Promise<{}> => {
  let chunkNumber = 0;

  const xmlsplit = new XmlSplit(settings.itemsPerChunk, settings.tagName);

  return new Promise((resolve, reject) => {
    xmlsplit.on("error", (err: string) => {
      if (err) reject(new Error(err));
    });
    inputStream.on("error", (err: string) => {
      if (err) reject(new Error(err));
    });

    inputStream
      .pipe(xmlsplit)
      .on("data", (data: any) => {
        outputStream(
          replaceResultTag(data, settings.tagName, chunkNumber),
          chunkNumber
        );
        chunkNumber += 1;
      })
      .on("end", () => {
        resolve(true);
      });
  });
};

export default splitXmlFile;
