import { CronJob } from "cron";
import moment from "moment";

import { Settings, CronJobItem } from "src/@types";

const config = {
  onComplete: null,
  start: true,
  timeZone: "Europe/Moscow",
  context: null,
  runOnInit: false,
};

const createCronJob = (
  settings: Settings,
  tickFunction: () => Promise<void>
): CronJobItem => {
  const job = new CronJob(
    settings.cronTimerString,
    tickFunction,
    config.onComplete,
    config.start,
    config.timeZone,
    config.context,
    config.runOnInit
  );

  const getNextDate = () => {
    return job.nextDates().format("DD.MM hh:mm");
  };

  const getLastDate = () => {
    return moment(job.lastDate()).format("DD.MM hh:mm");
  };

  return {
    job,
    getLastDate,
    getNextDate,
  };
};

export default createCronJob;
