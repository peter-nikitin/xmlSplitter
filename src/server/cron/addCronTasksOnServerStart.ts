import CronController from "./CronController";

import db from "../db/index";

import { Settings } from "src/@types";

const operations = db.getAllTasks();

const cron = new CronController();

operations.map((item: Settings) => cron.setCronJob(item));