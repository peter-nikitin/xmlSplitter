import moment from "moment";

import exportSplitUploadToFtp from "../stream/exportSplitUploadToFtp";

import createCronJob from "./createCronJob";
import db from "../db";

import { Settings, CronJobItem } from "src/@types";

class CronJobArray {
  tasks: { name: string; job: CronJobItem }[];

  constructor(jobsArray: [Settings]) {
    this.tasks = jobsArray.map((task: Settings) => this.setCronJob(task));
  }

  setCronJob(operationSettings: Settings) {
    const newCronJob = createCronJob(operationSettings, () =>
      exportSplitUploadToFtp(operationSettings)
    );
    return {
      name: operationSettings.taskName,
      job: newCronJob,
    };
  }
  addCronJob(operationSettings: Settings) {
    const newCronJob = createCronJob(operationSettings, () =>
      exportSplitUploadToFtp(operationSettings)
    );
    this.tasks.push({ name: operationSettings.taskName, job: newCronJob });
  }

  getCronJob(name: string) {
    const foundedCronJob = this.tasks.filter((item) => item.name === name);

    if (foundedCronJob.length === 0) return { status: "notFound" };
    return {
      status: "found",
      nextTick: foundedCronJob[0].job.getNextDate(),
      lastTick: foundedCronJob[0].job.getLastDate(),
    };
  }
}

export default CronJobArray;
