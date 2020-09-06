require("dotenv").config();
const CronModel = require("./models/CronModel");
const CronController = require("./controllers/");
const DbController = require("./controllers/DbController");
// const db = require("./db/index");

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

const cron = new CronModel(customerSettings);
console.log(cron.getNextDate());
