import CronJobsArray from "./CronJobsArray";

import db from "../db/index";

const scheduleCroJobsFromDb = () => {
  const operations = db.getAllTasks();
  const scheduledCronJobs = new CronJobsArray(operations);

  return scheduledCronJobs;
};

export default scheduleCroJobsFromDb;
