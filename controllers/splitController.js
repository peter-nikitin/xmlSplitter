кconst fs = require('fs')

const path = require('path');
const XmlSplit = require('xmlsplit');

class SplitController {
  constructor(filesArray, settings) {
    this.maxThred = 10;
    this.usedThred = 0;
    this.totalFilesCount = 0;
    this.splitedFilesCount = 0;
    this.files = filesArray;
    this.settings = settings;
    this.batchSize = 50000;
    this.tagName = "customer";
    this.xmlsplit = new XmlSplit(this.batchSize, this.tagName);
    this.savingErrors = [];
  }

  getFileAndSplit() {
    if (this.splitedFilesCount < this.totalFilesCount) {
      this.splitFile(this.files[this.splitedFilesCount]);

      this.splitedFilesCount += 1;
      this.usedThred += 1;
    } else {
      console.log(`Разделение закончено. Еще потоков: ${this.usedThred}`)
    }
  }

  init() {
    for (this.usedThred; this.usedThred < this.maxThred; this.usedThred = +1) {

      this.splitFile(this.files[this.usedThred]);

    }
  }

  saveFile(targetPath, data) {
    fs.writeFile(targetPath, data, (err) => {
      if (err) {
        this.savingErrors.push(err);
      }
    });
  }




  splitFile(fileName) {

    let chunckNumber = 0;
    const inputStream = fs.createReadStream(path.join(__dirname, `${this.settings.INPUT_FOLDER_NAME}/${fileName}`)) // from somewhere

    if (!fs.existsSync(path.join(__dirname, this.settings.OUTPUT_FOLDER_NAME))) {
      fs.mkdirSync(path.join(__dirname, this.settings.OUTPUT_FOLDER_NAME));
    }


    inputStream
      .pipe(this.xmlsplit)
      .on('data', (data) => {
        const xmlDocument = data.toString()

        const outPutFileName = `${fileName.split(".")[0]}-chunck-${chunckNumber}.xml`;
        const outputFolder = `/${this.settings.OUTPUT_FOLDER_NAME}/${fileName.split(".")[0]}-chuncks`;
        const outputFilePath = `/${outputFolder}/${outPutFileName}`;

        if (!fs.existsSync(path.join(__dirname, outputFolder))) {
          fs.mkdirSync(path.join(__dirname, outputFolder));
        }

        this.saveFile(path.join(__dirname, outputFilePath), xmlDocument);

        chunckNumber += 1;
      }).on("end", () => {
        console.log(`Done ${chunckNumber} chuncks`);
        this.usedThred -= 1;

        this.getFileAndSplit();
      });
  }
}

module.exports = SplitController;