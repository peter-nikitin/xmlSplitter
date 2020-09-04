const fs = require("fs");

const path = require("path");
const XmlSplit = require("xmlsplit");
const async = require("async");

class SplitController {
  constructor(settings, filesArray = []) {
    this.maxThred = 1;
    this.usedThred = 0;
    this.splitedFilesCount = 0;
    this.files = filesArray;
    this.settings = settings;
    this.batchSize = settings.ITEMS_PER_CHUNCK;
    this.tagName = settings.TAG_NAME;
    this.splitFile = this.splitFile.bind(this);
    this.savingErrors = [];
    // this.getFileAndSplit();
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

  splitFile(inputStream, outputStream) {
    this.chunckNumber = 0;

    const xmlsplit = new XmlSplit(this.batchSize, this.tagName);
    const outputFolder = `../${this.settings.OUTPUT_FOLDER_NAME}`;

    if (!fs.existsSync(path.join(__dirname, `${outputFolder}`))) {
      fs.mkdirSync(path.join(__dirname, `${outputFolder}`));
    }

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
          resolve();
        });
    });
  }
}

module.exports = SplitController;