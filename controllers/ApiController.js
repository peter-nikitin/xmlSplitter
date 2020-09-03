const axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');
const async = require('async');
const path = require('path');


class ApiController {
  constructor(operationName, targetLocalPath, targetLocalFileName) {
    this.endpoint = process.env.ENDPOINT;
    this.secretKey = process.env.SECRET_KEY;
    this.operation = operationName;
    this.targetLocalPath = targetLocalPath;
    this.targetLocalFileName = targetLocalFileName;
  }

  startExport() {
    const dateNow = Date.now();
    const tillDate = new Date(dateNow).toISOString();
    const periodInMiliseconds = 1 * 24 * 60 * 60 * 1000;
    const sinceDate = new Date(Date.now() - periodInMiliseconds).toISOString();

    return axios({
      url: `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.operation}`,
      method: 'post',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${this.secretKey}"`
      },
      data: {
        "sinceDateTimeUtc": sinceDate,
        "tillDateTimeUtc": tillDate,
      }
    }).then((response) => this.startCheckingExportTask(response.data.exportId))
  }

  startCheckingExportTask(taskID) {
    const intervalMinuts = 0.5 * 60 * 1000;
    console.log(`start interval ${intervalMinuts}`);
    return this.checkExportTask(taskID)
      // this.interval = setInterval(() => {
      // }, intervalMinuts)

    // return Promise.resolve()

  }

  checkExportTask(taskID) {
    return axios({
      url: `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.operation}`,
      method: 'post',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${this.secretKey}"`,
      },
      data: {
        exportId: taskID,
      }
    }).then((response) => {
      if (response.status !== 200) throw new Error('Status not 200')
      if (response.data.exportResult.processingStatus === "Ready") {
        // clearInterval(this.interval)
        return (this.downloadAllFiles(response.data.exportResult.urls, taskID))
      }
      return true;
    })


  }

  downloadAllFiles(filesArray, taskID) {
    return async.mapSeries(filesArray,
      (item, collback) => this.downloadResultFile(item, this.targetLocalPath, `${this.targetLocalFileName}-${taskID}`, collback))
  }

  downloadResultFile(url, targetPath, targetFileName, callback) {
    const saveStream = fs.createWriteStream(path.join(__dirname, `../${targetPath}/${targetFileName}.xml`));

    saveStream.on('data', () => {
      console.log("finis writing");
      // callback();
    })


    return axios({
        url,
        method: 'get',
        responseType: 'stream'
      })
      .then((response) => response.data.pipe(saveStream))
  }
}

module.exports = ApiController;