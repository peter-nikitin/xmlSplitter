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
    this.batchSize = 50000;
    this.tagName = "customer";

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

    if (!fs.existsSync(path.join(__dirname, `../${this.settings.OUTPUT_FOLDER_NAME}`))) {
      fs.mkdirSync(path.join(__dirname, `../${this.settings.OUTPUT_FOLDER_NAME}`));
    }

    const outputFolder = `../${this.settings.OUTPUT_FOLDER_NAME}`;

    if (!fs.existsSync(path.join(__dirname, outputFolder))) {
      fs.mkdirSync(path.join(__dirname, outputFolder));
    }

    xmlsplit.on('error', err => callback(err));
    inputStream.on('error', err => {
      callback(err)
    });


    inputStream
      .pipe(xmlsplit)
      .on('data', (data) => {
        const xmlDocument = data.toString();
        const outPutFileName = `${outputFolder}/${fileName.split(".")[0]}-chunck-${this.chunckNumber}.xml`;

        this.saveFile(path.join(__dirname, outPutFileName), xmlDocument);
        this.chunckNumber += 1;
      }).on("end", () => {
        console.log(`Done ${this.chunckNumber} chuncks`);
        callback();
      });

  }
}

module.exports = SplitController;