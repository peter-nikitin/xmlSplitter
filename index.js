require('dotenv').config()
const path = require('path');
const SplitController = require('./controllers/splitController');
const FtpController = require('./controllers/FtpController');
const getFilesFromFolder = require('./utils/getFilesFromFolder');

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ
const settings = {
    "INPUT_FOLDER_NAME": "data/from-ftp",
    "OUTPUT_FOLDER_NAME": "data/test-chuncks",
    "INPUT_FOLDER_NAME_ON_FTP": "CustomerData",
    "OUTPUT_FOLDER_NAME_ON_FTP": "test-chuncks",
    "TAG_NAME": "customer",
    "ITEMS_PER_CHUNCK": 50000,

  }
  // ДАЛЬШЕ ЛУЧШЕ НИЧЕГО НЕ ТРОГАТЬ
  // ----------------------

const FTP = new FtpController(settings);
const splitter = new SplitController(getFilesFromFolder(settings.INPUT_FOLDER_NAME), settings);



splitter.getFileAndSplit()
  .then(() => console.log(`finish splitting files ${getFilesFromFolder(settings.OUTPUT_FOLDER_NAME).join()}`))
  .then(() => FTP.checkFolder(settings.OUTPUT_FOLDER_NAME_ON_FTP, "/"))
  .then((isFound) => {
    if (!isFound) return FTP.makeFolder(`/${settings.OUTPUT_FOLDER_NAME_ON_FTP}`);
    return Promise.resolve();
  })
  .then(() => console.log(`start uploading files ${getFilesFromFolder(settings.OUTPUT_FOLDER_NAME).join()}`))
  .then(() => FTP.uploadAllFilesFromLocalFolder(
    getFilesFromFolder(settings.OUTPUT_FOLDER_NAME),
    `/${settings.OUTPUT_FOLDER_NAME_ON_FTP}`))
  .then(() => console.log("done"))
  .catch((err) => console.log(err))






// НИЖЕ ВСЯКИЙ ТЕСТОВЫЙ БРЕД
// ----------------------

// FTP.downloadFile('CustomerData', '1 èç 1 - DetmirRu - Êëèåíòû - 31.08.2020 08-56 - 73490 - 2d59dac3-d745-4dce-9271-211d19d83864.xml.gz', settings.INPUT_FOLDER_NAME, () => {})
// FTP.downloadFile('CustomerData/test.xml.gz', path.join(__dirname, `${settings.INPUT_FOLDER_NAME}`), () => {})

// FTP.getFilesInFolder(`/CustomerData`)
//   .then((items) => console.log(items))

//   .then(() => FTP.downloadAllFilesFromFolder(settings.INPUT_FOLDER_NAME))
//   .then(() => console.log(`finish downloading files ${getFilesFromFolder(settings.INPUT_FOLDER_NAME).join()}`))
// .then(() => new SplitController(getFilesFromFolder(settings.INPUT_FOLDER_NAME), settings).getFileAndSplit())
// .then(() => console.log(`finish splitting files ${getFilesFromFolder(settings.OUTPUT_FOLDER_NAME).join()}`))
// .then(() => FTP.checkFolder(settings.OUTPUT_FOLDER_NAME_ON_FTP, "/"))
// .then((isFound) => {
//   if (!isFound) {
//     return FTP.makeFolder(`/${settings.OUTPUT_FOLDER_NAME_ON_FTP}`);
//   }
//   return Promise.resolve();
// })
// .then(() => console.log(`start uploading files ${getFilesFromFolder(settings.OUTPUT_FOLDER_NAME).join()}`))
// .then(() => FTP.uploadAllFilesFromLocalFolder(
//   getFilesFromFolder(settings.OUTPUT_FOLDER_NAME),
//   `/${settings.OUTPUT_FOLDER_NAME_ON_FTP}`))
// .then(() => console.log("done"))
// .catch((err) => console.log(err))

//