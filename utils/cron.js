const CronController = require("../controllers/CronController");
const CronModel = require("../models/CronModel");

const db = require("../db/index");

const operations = db.getOperations();

operations.map((item) => CronController.setCronJob(item));
