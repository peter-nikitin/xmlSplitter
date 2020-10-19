import CronController from "../controllers/CronController";

import db from "../db/index";

import { Settings } from "../declare/types.d";

const operations = db.getOperations();
const cronInstance = new CronController();

operations.map((item: Settings) => cronInstance.setCronJob(item));
