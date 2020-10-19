import { CronJob } from "cron";
import FtpController from "../controllers/FtpController";
import ApiController from "../controllers/ApiController";
import SplitController from "../controllers/splitController";
import db from "../db";

import { Settings } from "../declare/types.d";

class CronModel {
  settings: Settings;
  cronTime: string;
  onComplete: null;
  start: boolean;
  timeZone: string;
  context: null;
  runOnInit: boolean;
  FTP: FtpController;
  splitController: SplitController;
  apiController: ApiController;
  job: CronJob;

  constructor(settings: Settings) {
    this.settings = settings;
    this.cronTime = settings.cronTimerString;
    this.onComplete = null;
    this.start = true;
    this.timeZone = "Europe/Moscow";
    this.context = null;
    this.runOnInit = false;
    this.FTP = new FtpController(this.settings);
    this.splitController = new SplitController(this.settings);
    this.apiController = new ApiController(this.settings, this.FTP.uploadFile);
    this.tick = this.tick.bind(this);
    this.job = new CronJob(
      this.cronTime,
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

  tick() {
    this.apiController
      .startExport()
      .then((response) =>
        this.apiController.startCheckingExportTask(response.data.exportId)
      )
      .then((urlsArray) =>
        this.apiController.downloadAllFiles(
          urlsArray as string[],
          this.splitController.splitFile
        )
      )
      .then(() =>
        db.saveLogs(this.settings.taskName, {
          operation: this.settings.taskName,
          date: new Date(),
          data: `✅ Успешно завершено. Экспортировано, поделено, загружено на ФТП`,
        })
      )
      .catch((err) =>
        db.saveLogs(this.settings.taskName, {
          operation: this.settings.taskName,
          date: new Date(),
          data: `❌ Ошибка: ${err}`,
        })
      );
  }
}

export default CronModel;
