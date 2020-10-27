import { CronJob } from "cron";
import moment from "moment";

import { Settings } from "../declare/types.d";

class CronModel {
  settings: Settings;
  private onComplete: null = null;
  private start: boolean = true;
  private timeZone: string = "Europe/Moscow";
  private context: null = null;
  private runOnInit: boolean = false;
  job: CronJob;

  constructor(settings: Settings, tickFunction: () => void) {
    this.settings = settings;
    this.job = new CronJob(
      this.settings.cronTimerString,
      tickFunction,
      this.onComplete,
      this.start,
      this.timeZone,
      this.context,
      this.runOnInit
    );
  }

  getNextDate() {
    return this.job.nextDates().format("DD.MM hh:mm");
  }

  getLastDate() {
    return moment(this.job.lastDate()).format("DD.MM hh:mm");
  }
}

export default CronModel;
