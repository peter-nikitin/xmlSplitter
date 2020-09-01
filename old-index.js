const fs = require('fs')

const path = require('path');
const XmlSplit = require('xmlsplit')

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ
const settings = {
    "INPUT_FOLDER_NAME": "/data/from-ftp",
    "OUTPUT_FOLDER_NAME": "/data/test-chunks",
    "TAG_NAME": "customerAction",
    "ITEMS_PER_CHUNCK": 5,
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

  const xmlsplit = new XmlSplit(settings.ITEMS_PER_CHUNCK, settings.TAG_NAME)

  const nexIndex = index + 1;
  const fileName = array[index];
  let chunckNumber = 0;

  const inputStream = fs.createReadStream(path.join(__dirname, `${settings.INPUT_FOLDER_NAME}/${fileName}`)) // from somewhere

  if (!fs.existsSync(path.join(__dirname, settings.OUTPUT_FOLDER_NAME))) {
    fs.mkdirSync(path.join(__dirname, settings.OUTPUT_FOLDER_NAME));
  }

  inputStream
    .pipe(xmlsplit)
    .on('data', function(data) {
      let xmlDocument = data.toString().replace('</result>', `</${settings.TAG_NAME}s></result>`)
      if (chunckNumber > 0) {
        xmlDocument = xmlDocument.replace('<result>', `<result><${settings.TAG_NAME}s>`)
      }
      const outPutFileName = `${fileName.split(".")[0]}-chunck-${chunckNumber}.xml`;
      const outputFolder = `/${settings.OUTPUT_FOLDER_NAME}/${fileName.split(".")[0]}-chuncks`;
      const outputFilePath = `/${outputFolder}/${outPutFileName}`;

      if (!fs.existsSync(path.join(__dirname, outputFolder))) {
        fs.mkdirSync(path.join(__dirname, outputFolder));
      }

      saveFile(path.join(__dirname, outputFilePath), xmlDocument);

      chunckNumber += 1;

    }).on("end", () => {
      console.log(`Done ${chunckNumber} chuncks`);
      if (nexIndex < array.length) {

        setTimeout(() => splitFile(nexIndex, array), 1000)
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

  console.log(arrayOfItems);


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