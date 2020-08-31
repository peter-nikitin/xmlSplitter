require('dotenv').config()
const SplitController = require('./controllers/splitController');
const FtpController = require('./controllers/FtpController');
const getFilesFromFolder = require('./utils/getFilesFromFolder');

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ
const settings = {
    "INPUT_FOLDER_NAME": "data/FromFTP",
    "OUTPUT_FOLDER_NAME": "data/DetmirRu-small-chunks"
  }
  // ДАЛЬШЕ ЛУЧШЕ НИЧЕГО НЕ ТРОГАТЬ
  // ----------------------

const FTP = new FtpController();

const targetFolderOnFtp = "/Test divide";
// const targetFolderLocal = "./data/FromFTP";

// FTP.getFilesInFolder(targetFolderOnFtp)
//   .then(() => FTP.downloadAllFilesFromFolder(settings.INPUT_FOLDER_NAME))
//   .then(() => {
//     console.log("start splitting");
//     return new SplitController(getFilesFromFolder(settings.INPUT_FOLDER_NAME), settings).getFileAndSplit()
//   })
//   .then(() => {
//     console.log(`start uploading files ${getFilesFromFolder(settings.OUTPUT_FOLDER_NAME).join()}`);
//     return ;
//   })
//   .then(() => console.log("done"))
//   .catch((err) => console.log(err))
//   // console.log(split);

FTP.uploadAllFilesFromLocalFolder(
  getFilesFromFolder(settings.OUTPUT_FOLDER_NAME),
  settings.OUTPUT_FOLDER_NAME).catch((err) => console.log(err))