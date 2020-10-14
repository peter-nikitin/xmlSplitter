const axios = require("axios");
const async = require("async");
const path = require("path");
const db = require("../db");

class ApiController {
  constructor(settings, outputStream) {
    this.endpoint = process.env.ENDPOINT;
    this.secretKey = process.env.SECRET_KEY;
    this.operation = settings.OPERATION_NAME;
    this.targetPath = settings.OUTPUT_FOLDER_NAME_ON_FTP;
    this.taskID = 0;
    this.exportPeriodHours = settings.EXPORT_PERIOD_HOURS;
    this.urlsFromExport = [];
    this.outputStream = outputStream;
    this.exportName = settings.TAG_NAME;
    this.settings = settings;
  }

  startExport() {
    const dateNow = Date.now();
    const tillDate = new Date(dateNow).toISOString();
    const periodInMiliseconds = this.exportPeriodHours * 60 * 60 * 1000;
    const sinceDate = new Date(Date.now() - periodInMiliseconds).toISOString();

    return axios({
      url: `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.operation}`,
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${this.secretKey}"`,
      },
      data: {
        sinceDateTimeUtc: sinceDate,
        tillDateTimeUtc: tillDate,
      },
    });
  }

  startCheckingExportTask(taskID) {
    db.saveLogs(this.settings.NAME, {
      date: new Date(),
      data: `Поставлена задача экспорта №: ${taskID}`,
    });
    this.taskID = taskID;
    const intervalMinuts = 1.0;
    const intervalMiliseconds = intervalMinuts * 60 * 1000;

    return new Promise((resolve, reject) => {
      this.interval = setInterval(() => {
        this.checkExportTask(taskID).then((response) => {
          db.saveLogs(this.settings.NAME, {
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

  checkExportTask(taskID) {
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

  downloadAllFiles(filesArray, outputStreamHendler) {
    return async.mapSeries(filesArray, (item, collback) =>
      this.downloadResultFile(item, outputStreamHendler, collback)
    );
  }

  downloadResultFile(url, streamHendler, collback) {
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
            (data, chunk) =>
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

module.exports = ApiController;
