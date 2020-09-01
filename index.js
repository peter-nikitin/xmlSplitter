require('dotenv').config()
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

const targetFolderOnFtp = "/Test divide";
// const targetFolderLocal = "./data/FromFTP";

// console.log(FTP.uploadFile('data/test-chuncks/0523-chunck-0.xml', '/test-chuncks/0523-chunck-0.xml', () => {}));

FTP.targetFileOnFtp = '';
// FTP.downloadFile('CustomerData/1 из 1 - DetmirRu - 1 - 01.09.2020 08-57 - 73726 - 85d32950-962f-4fed-99ec-79e5c20d2600.xml.gz', `./${settings.INPUT_FOLDER_NAME}`, () => {})
FTP.downloadFile('CustomerData/test.xml.gz', `./${settings.INPUT_FOLDER_NAME}`, () => {})

// FTP.getFilesInFolder(`/${settings.INPUT_FOLDER_NAME_ON_FTP}`)
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