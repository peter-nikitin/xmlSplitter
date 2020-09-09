const { CronJob } = require("cron");
const FtpController = require("../controllers/FtpController");
const ApiController = require("../controllers/ApiController");
const SplitController = require("../controllers/splitController");
const db = require("../db");

class CronModel {
  constructor(settings) {
    this.settings = settings;
    this.cronTime = settings.CRON_TIME;
    this.onComplete = null;
    this.start = true;
    this.timeZone = "Europe/Moscow";
    this.context = null;
    this.runOnInit = false;
    this.FTP = new FtpController(this.settings);
    this.splitController = new SplitController(this.settings);
    this.apiController = new ApiController(this.settings, this.FTP);
    this.tick = this.tick.bind(this);
    this.init();
  }

  init() {
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
          urlsArray,
          this.splitController.splitFile
        )
      )
      .then(() =>
        db.saveLogs(this.settings.NAME, {
          date: new Date(),
          data: `✅ Успешно завершено. Экспортировано, поделено, загружено на ФТП`,
        })
      )
      .catch((err) =>
        db.saveLogs(this.settings.NAME, {
          date: new Date(),
          data: `❌ Ошибка: ${err}`,
        })
      );
  }
}

module.exports = CronModel;
