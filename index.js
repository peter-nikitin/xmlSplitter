require("dotenv").config();
const CronModel = require("./models/CronModel");
// const CronController = require("./controllers/");
const DbController = require("./controllers/DbController");
const db = require("./db/index");

const FtpController = require("./controllers/FtpController");
const ApiController = require("./controllers/ApiController");
const SplitController = require("./controllers/splitController");

// console.log(db);

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ

const customerSettings = {
  NAME: "customers",
  OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
  TAG_NAME: "customer",
  ITEMS_PER_CHUNCK: 50000,
  OPERATION_NAME: "exportSegmentsPart3",
  EXPORT_PERIOD_HOURS: 24,
  CRON_TIME: "0 39 18 * * *",
};

// const db = new DbController("./db/db.js");
// console.log(db.getOperations());

const FTP = new FtpController(customerSettings);
const splitController = new SplitController(customerSettings);
const apiController = new ApiController(customerSettings, FTP.uploadFile);

const cron = new CronModel(customerSettings);
cron.tick();

// const manualDownload = (exportID) => {
//   apiController.startExport().then((response) => apiController.startCheckingExportTask(
//     [
//       "https://mindboxfilesforclients.blob.core.windows.net/export/1%20%D0%B8%D0%B7%201%20-%20DetmirRu%20-%20%D0%9A%D0%BB%D0%B8%D0%B5%D0%BD%D1%82%D1%8B%20-%2007.09.2020%2016-26%20-%2074566%20-%2091440603-5bed-441a-a871-ce0e1084d2f6.xml",
//     ],
//     splitController.splitFile
//   ))

//     .then(() =>
//       db.saveLogs(customerSettings.NAME, {
//         date: new Date(),
//         data: `✅ Успешно завершено. Экспортировано, поделено, загружено на ФТП`,
//       })
//     )
//     .catch((err) =>
//       db.saveLogs(customerSettings.NAME, {
//         date: new Date(),
//         data: `❌ Ошибка: ${err}`,
//       })
//     );
// };

// manualDownload(74566);
