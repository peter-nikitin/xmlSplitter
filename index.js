require("dotenv").config();
const FtpController = require("./controllers/FtpController");
const ApiController = require("./controllers/ApiController");
const SplitController = require("./controllers/splitController");

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ
const settings = {
  INPUT_FOLDER_NAME: "data/from-api",
  OUTPUT_FOLDER_NAME: "data/test-chuncks",
  TARGET_FIlE_NAME: "from-export",
  INPUT_FOLDER_NAME_ON_FTP: "CustomerData",
  OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
  TAG_NAME: "customer",
  ITEMS_PER_CHUNCK: 50000,
  OPERATION_NAME: "exportSegmentsPart3",
  EXPORT_PERIOD_HOURS: 1,
};
// ДАЛЬШЕ ЛУЧШЕ НИЧЕГО НЕ ТРОГАТЬ
// ----------------------

const FTP = new FtpController(settings);
const splitController = new SplitController(settings);
const apiController = new ApiController(settings, FTP);

apiController.startExport()
  .then((response) => apiController.startCheckingExportTask(response.data.exportId))
  .then((urlsArray) => apiController.downloadAllFiles(urlsArray, splitController.splitFile))
  .then(() => console.log("Done export, splittin and uploading"))
  .catch((err) => console.log(err));