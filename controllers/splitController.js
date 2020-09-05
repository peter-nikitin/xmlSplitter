const fs = require("fs");
const XmlSplit = require("xmlsplit");
const async = require("async");

class SplitController {
  constructor(settings) {
    this.batchSize = settings.ITEMS_PER_CHUNCK;
    this.tagName = settings.TAG_NAME;
    this.splitFile = this.splitFile.bind(this);
    this.savingErrors = [];
  }

  getFileAndSplit() {
    return async.mapSeries(this.files, (item, callback) => {
      return this.splitFile(item, callback);
    });
  }

  saveFile(targetPath, data) {
    fs.writeFile(targetPath, data, (err) => {
      if (err) {
        this.savingErrors.push(err);
      }
    });
  }

  splitFile(inputStream, outputStream, collback) {
    this.chunckNumber = 0;

    const xmlsplit = new XmlSplit(this.batchSize, this.tagName);

    return new Promise((resolve, reject) => {
      xmlsplit.on("error", (err) => {
        if (err) {
          reject(new Error(err));
        }
      });
      inputStream.on("error", (err) => {
        if (err) {
          reject(new Error(err));
        }
      });

      inputStream
        .pipe(xmlsplit)
        .on("data", (data) => {
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
          console.log(`Done spliiting. Total: ${this.chunckNumber} chuncks`);
          collback();
          resolve();
        });
    });
  }
}

module.exports = SplitController;
