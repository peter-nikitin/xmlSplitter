require("dotenv").config();
const FtpController = require("./controllers/FtpController");
const ApiController = require("./controllers/ApiController");
const SplitController = require("./controllers/splitController");
const CronController = require("./controllers/CronController");

// ---------------------
// СЮДА ВВЕДИ НАЗВАНИЕ ПАПКИ ИЗ КОТОРОЙ НАДО ВЗЯТЬ И КУДА НАДО ПОЛОЖИТЬ

const customerSettings = {
  OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
  TAG_NAME: "customer",
  ITEMS_PER_CHUNCK: 50000,
  OPERATION_NAME: "exportSegmentsPart3",
  EXPORT_PERIOD_HOURS: 24,
  CRON_TIME: "0 39 18 * * *",
};

const cron = new CronController(customerSettings);
