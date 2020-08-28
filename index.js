var fs = require('fs')

const path = require('path');
const es = require('event-stream')
const XmlSplit = require('xmlsplit')


const xmlsplit = new XmlSplit(batchSize = 50000, tagName = "customer")

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ
const settings = {
    "INPUT_FOLDER_NAME": "/data/test",
    "OUTPUT_FOLDER_NAME": "/data/DetmirRu-small-chunks"
  }
  // ДАЛЬШЕ ЛУЧШЕ НИЧЕГО НЕ ТРОГАТЬ
  // ----------------------

const saveFile = (path, data) => {
  fs.writeFile(path, data, function(err, data) {
    if (err) {
      return console.log(err);
    }
  });
}




const splitFile = (index, array) => {

  let nexIndex = index + 1;
  const fileName = array[index];
  let chunckNumber = 0;
  console.log(fileName);
  var inputStream = fs.createReadStream(path.join(__dirname, `${settings.INPUT_FOLDER_NAME}/${fileName}`)) // from somewhere

  if (!fs.existsSync(path.join(__dirname, settings.OUTPUT_FOLDER_NAME))) {
    fs.mkdirSync(path.join(__dirname, settings.OUTPUT_FOLDER_NAME));
  }

  inputStream
    .pipe(xmlsplit)
    .on('data', function(data) {
      var xmlDocument = data.toString()

      const outPutFileName = `${fileName.split(".")[0]}-chunck-${chunckNumber}.xml`;
      const outputFolder = `/${settings.OUTPUT_FOLDER_NAME}/${fileName.split(".")[0]}-chuncks`;
      const outputFilePath = `/${outputFolder}/${outPutFileName}`;

      if (!fs.existsSync(path.join(__dirname, outputFolder))) {
        fs.mkdirSync(path.join(__dirname, outputFolder));
      }

      saveFile(path.join(__dirname, outputFilePath), xmlDocument);

      chunckNumber = chunckNumber + 1;

    }).on("end", () => {
      console.log(`Done ${chunckNumber} chuncks`);
      if (nexIndex < array.length) {

        splitFile(nexIndex, array);
      }
    });
}


const getFilesFromFolder = (folder) => {
  const arrayOfItems = [];
  const filesInFolder = fs.readdirSync(path.join(__dirname, folder));

  filesInFolder.forEach((file) => {
    if (path.extname(file) === ".xml") {
      arrayOfItems.push(file)
    }
  })


  console.log(`Get ${filesInFolder.length} files& Start spliting`);
  return arrayOfItems;
}


const getFilesAndSplit = (settings) => {
  const filesArray = getFilesFromFolder(settings.INPUT_FOLDER_NAME);

  if (filesArray.length > 0) {
    splitFile(0, filesArray);
  }
}


getFilesAndSplit(settings);