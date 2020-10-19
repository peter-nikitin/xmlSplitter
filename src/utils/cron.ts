import CronController from "../controllers/CronController";

import db from "../db/index";

import { Settings } from "../declare/types.d";

const operations = db.getOperations();

export default operations.map((item: Settings) =>
  CronController.setCronJob(item)
);
