import moment from "moment";

import exportSplitUploadToFtp from "../stream/exportSplitUploadToFtp";

import createCronJob from "./createCronJob";
import db from "../db";

import { Settings, CronJobItem } from "src/@types";

class CronJobsArray {
  tasks: { name: string; job: CronJobItem }[];

  constructor(jobsArray: Settings[]) {
    this.tasks = jobsArray.map((task: Settings) => this.setManyCronJobs(task));
  }

  setManyCronJobs(operationSettings: Settings) {
    const newCronJob = createCronJob(operationSettings, () =>
      exportSplitUploadToFtp({
        exportRange: {
          sinceDateTimeUtc: `${moment()
            .subtract(1, "day")
            .format("DD.MM.YYYY")} 20:00`,
          tillDateTimeUtc: `${moment().format("DD.MM.YYYY")} 20:00`,
        },
        ftpSettings: {
          host: process.env.FTP_HOST || "",
          password: process.env.FTP_PASS || "",
          port: +(process.env.FTP_PORT || 21),
          user: process.env.FTP_USER || "",
        },
        requestSettings: {
          endpointId: process.env.ENDPOINT || "",
          operation: operationSettings.operationName,
          secretKey: process.env.SECRET_KEY || "",
        },
        settings: operationSettings,
      })
    );
    return {
      name: operationSettings.taskName,
      job: newCronJob,
    };
  }
  addOneCronJob(operationSettings: Settings) {
    const newCronJob = createCronJob(operationSettings, () =>
      exportSplitUploadToFtp({
        exportRange: {
          sinceDateTimeUtc: `${moment()
            .subtract(1, "day")
            .format("DD.MM.YYYY")} 20:00`,
          tillDateTimeUtc: `${moment().format("DD.MM.YYYY")} 20:00`,
        },
        ftpSettings: {
          host: process.env.FTP_HOST || "",
          password: process.env.FTP_PASS || "",
          port: +(process.env.FTP_PORT || 21),
          user: process.env.FTP_USER || "",
        },
        requestSettings: {
          endpointId: process.env.ENDPOINT || "",
          operation: operationSettings.operationName,
          secretKey: process.env.SECRET_KEY || "",
        },
        settings: operationSettings,
      })
    );
    this.tasks.push({ name: operationSettings.taskName, job: newCronJob });
  }

  getOneCronJob(name: string) {
    const foundedCronJob = this.tasks.filter((item) => item.name === name);

    if (foundedCronJob.length === 0) return { status: "notFound" };
    return {
      status: "found",
      nextTick: foundedCronJob[0].job.getNextDate(),
      lastTick: foundedCronJob[0].job.getLastDate(),
    };
  }
}

export default CronJobsArray;
