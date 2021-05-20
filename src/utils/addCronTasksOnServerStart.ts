import CronController from "../controllers/CronController";

import db from "../db/index";

import { Settings } from "../declare/types.d";

const operations = db.getAllTasks();

const cron = new CronController();

operations.map((item: Settings) => cron.setCronJob(item));
