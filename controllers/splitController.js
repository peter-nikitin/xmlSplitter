const fs = require('fs')

const path = require('path');
const XmlSplit = require('xmlsplit');
const async = require('async');


class SplitController {
  constructor(filesArray, settings) {
    this.maxThred = 1;
    this.usedThred = 0;
    this.splitedFilesCount = 0;
    this.files = filesArray;
    this.settings = settings;
    this.batchSize = settings.ITEMS_PER_CHUNCK;
    this.tagName = settings.TAG_NAME;

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


  splitFile(fileName, callback) {
    this.chunckNumber = 0;
    const inputStream = fs.createReadStream(path.join(__dirname, `../${this.settings.INPUT_FOLDER_NAME}/${fileName}`)) // from somewhere

    const xmlsplit = new XmlSplit(this.batchSize, this.tagName);
    const outputFolder = `../${this.settings.OUTPUT_FOLDER_NAME}`;

    if (!fs.existsSync(path.join(__dirname, `${outputFolder}`))) {
      fs.mkdirSync(path.join(__dirname, `${outputFolder}`));
    }


    xmlsplit.on('error', err => {
      if (err) {
        const error = new Error(err);
        throw error;
      };
      callback(err)
    });
    inputStream.on('error', err => {
      if (err) {
        const error = new Error(err);
        throw error;
      };
      callback(err)
    });


    inputStream
      .pipe(xmlsplit)
      .on('data', (data) => {
        const outPutFileName = `${outputFolder}/${fileName.split(".")[0]}-chunck-${this.chunckNumber}.xml`;

        let xmlDocument = data.toString().replace('</result>', `</${this.tagName}s></result>`)

        if (this.chunckNumber > 0) {
          xmlDocument = xmlDocument.replace('<result>', `<result><${this.tagName}s>`)
        }

        this.saveFile(path.join(__dirname, outPutFileName), xmlDocument);
        this.chunckNumber += 1;
      }).on("end", () => {
        console.log(`Done ${this.chunckNumber} chuncks`);
        callback();
      });

  }
}

module.exports = SplitController;