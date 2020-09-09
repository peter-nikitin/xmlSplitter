const CronModel = require("../models/CronModel");
const db = require("../db");

class CronController {
  constructor() {
    this.cron = 1;
  }

  setCronJob(operationSettings) {
    console.log(`start ${operationSettings.NAME}`);
    this[operationSettings.NAME] = new CronModel(operationSettings);
    db.saveLogs(operationSettings.NAME, {
      date: new Date(),
      data: `Поставлена регулярная задача. Следующее выполнение ${new Date(
        this[operationSettings.NAME].getNextDate()
      ).toLocaleString("ru-RU")}`,
    });
  }

  getCronJob(name) {
    if (typeof this[name] === "undefined") return { status: "notFound" };
    return {
      status: "found",
      nextTick: this[name].getNextDate(),
      lastTick: this[name].getLastDate(),
    };
  }
}

module.exports = new CronController();
