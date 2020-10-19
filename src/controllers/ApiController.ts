import axios from "axios";
import async from "async";
import moment from "moment";

import db from "../db";

import { Settings } from "../declare/types.d";

class ApiController {
  endpoint: string | undefined;
  secretKey: string | undefined;
  operation: string;
  targetPath: string;
  taskID: number;
  exportPeriodHours: number;
  urlsFromExport: string[];
  outputStream: Function;
  exportName: string;
  settings: Settings;
  interval: NodeJS.Timeout;

  constructor(settings: Settings, outputStream: Function) {
    this.endpoint = process.env.ENDPOINT;
    this.secretKey = process.env.SECRET_KEY;
    this.operation = settings.operationName;
    this.targetPath = settings.outputPath;
    this.taskID = 0;
    this.exportPeriodHours = settings.exportPeriodHours;
    this.urlsFromExport = [];
    this.outputStream = outputStream;
    this.exportName = settings.tagName;
    this.settings = settings;
  }

  startExport() {
    const tillDate = moment().utc().format("DD.MM.YYYY");
    const sinceDate = moment()
      .subtract(this.exportPeriodHours, "hours")
      .format("DD.MM.YYYY");
    console.log({
      sinceDateTimeUtc: `${sinceDate} 23:00:00`,
      tillDateTimeUtc: `${tillDate} 23:00:00`,
    });
    return axios({
      url: `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.operation}`,
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${this.secretKey}"`,
      },
      data: {
        sinceDateTimeUtc: `${sinceDate} 23:00:00`,
        tillDateTimeUtc: `${tillDate} 23:00:00`,
      },
    });
  }

  startCheckingExportTask(taskID: number) {
    db.saveLogs(this.settings.operationName, {
      operation: this.settings.operationName,
      date: new Date(),
      data: `Поставлена задача экспорта №: ${taskID}`,
    });
    this.taskID = taskID;
    const intervalMinuts = 1.0;
    const intervalMiliseconds = intervalMinuts * 60 * 1000;

    return new Promise((resolve, reject) => {
      this.interval = setInterval(() => {
        this.checkExportTask(taskID).then((response) => {
          db.saveLogs(this.settings.operationName, {
            operation: this.settings.operationName,
            date: new Date(),
            data: `Проверяем задачу. Статус: ${response.data.exportResult.processingStatus}`,
          });

          if (response.status !== 200) reject(new Error("Status not 200"));
          if (response.data.exportResult.processingStatus === "Ready") {
            clearInterval(this.interval);
            this.urlsFromExport = response.data.exportResult.urls;
            resolve(response.data.exportResult.urls);
          }
        });
      }, intervalMiliseconds);
    });

    // return Promise.resolve()
  }

  checkExportTask(taskID: number) {
    return axios({
      url: `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.operation}`,
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${this.secretKey}"`,
      },
      data: {
        exportId: taskID,
      },
    });
  }

  downloadAllFiles(filesArray: string[], outputStreamHendler: any) {
    return async.mapSeries(filesArray, (item, collback) =>
      this.downloadResultFile(item, outputStreamHendler, collback)
    );
  }

  downloadResultFile(
    url: string,
    streamHendler: Function,
    collback: CallableFunction
  ) {
    return new Promise((resolve, reject) => {
      axios({
        url,
        method: "get",
        responseType: "stream",
      })
        .then((response) => {
          if (response.status !== 200) reject(new Error("Status no 200"));
          streamHendler(
            response.data,
            (data: any, chunk: string) =>
              this.outputStream(
                `/${this.targetPath}/export-${this.exportName}-${this.taskID}-${chunk}.xml`,
                data
              ),
            collback
          );
        })
        .catch((err) => reject(err));
    });
  }
}

export default ApiController;
