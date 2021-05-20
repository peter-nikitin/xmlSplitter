import moment from "moment";

import MainController from "../controllers/MainController";

import CronModel from "../models/CronModel";
import db from "../db";

import { Settings } from "../declare/types.d";

class CronController {
  tasks: CronModel[] = [];

  constructor() {}

  setCronJob(operationSettings: Settings) {
    // TODO: написать нормальную функцию
    const newCronJob = new CronModel(operationSettings, () => {
      try {
        const main = new MainController(operationSettings);
        main.exportAndUpload();
      } catch (error) {
        throw error;
      }
    });
    this.tasks.push(newCronJob);
  }

  getCronJob(name: string) {
    const foundedCronJob = this.tasks.filter(
      (item) => item.settings.taskName === name
    );

    if (foundedCronJob.length === 0) return { status: "notFound" };
    return {
      status: "found",
      nextTick: foundedCronJob[0].getNextDate(),
      lastTick: foundedCronJob[0].getLastDate(),
    };
  }
}

export default CronController;
