import { CronJob } from "cron";
import FtpController from "./FtpModel";
import ApiController from "../controllers/ApiController";
import SplitController from "../controllers/splitController";
import db from "../db";

import { Settings } from "../declare/types.d";

class CronModel {
  settings: Settings;
  onComplete: null = null;
  start: boolean = true;
  timeZone: string = "Europe/Moscow";
  context: null = null;
  runOnInit: boolean = false;
  FTP: FtpController;
  splitController: SplitController;
  apiController: ApiController;
  job: CronJob;
  tick: () => void;

  constructor(settings: Settings, tickFunction: () => void) {
    this.settings = settings;
    this.tick = tickFunction;
    this.job = new CronJob(
      this.settings.cronTimerString,
      this.tick,
      this.onComplete,
      this.start,
      this.timeZone,
      this.context,
      this.runOnInit
    );
  }

  getNextDate() {
    return this.job.nextDates();
  }

  getLastDate() {
    return this.job.lastDate();
  }
}

export default CronModel;
