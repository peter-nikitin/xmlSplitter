import axios, { AxiosError, AxiosResponse } from "axios";
import async from "async";
import moment, { Moment } from "moment";

import db from "../db";

import { Settings, ExportRange } from "../declare/types.d";

import ApiModel from "../models/ApiModel";

type exportedFilesArray = string[];

class ApiController {
  api: ApiModel;
  settings: Settings;
  interval: NodeJS.Timeout;

  constructor(settings: Settings) {
    this.settings = settings;
    this.api = new ApiModel(this.settings);
  }

  async exportData(exportRange?: ExportRange) {
    let sinceDateTimeUtc: string, tillDateTimeUtc: string;
    sinceDateTimeUtc = exportRange?.sinceDateTimeUtc
      ? exportRange.sinceDateTimeUtc.format("DD.MM.YYYY hh:MM:ss")
      : `${moment()
          .subtract(this.settings.exportPeriodHours, "hours")
          .format("DD.MM.YYYY")} 23:00:00`;

    tillDateTimeUtc = exportRange?.tillDateTimeUtc
      ? exportRange.tillDateTimeUtc.format("DD.MM.YYYY hh:MM:ss")
      : `${moment().utc().format("DD.MM.YYYY")} 23:00:00`;

    const exportId = await this.api.startExport(
      sinceDateTimeUtc,
      tillDateTimeUtc
    );

    const resultedFiles = await this.regularCheckingExportStatus(
      exportId.data.exportId
    );
    return resultedFiles;
  }

  checkExport(
    exportId: string,
    resolveCallback: (response: exportedFilesArray) => void,
    rejectCallback: (error: AxiosError) => void
  ) {
    this.api
      .checkExportResult(exportId)
      .then((response) => {
        if (response.status !== 200) {
          rejectCallback(response.data);
        }
        if (response.data.file.processingStatus === "Ready") {
          if (this.interval) {
            clearInterval(this.interval);
          }
          resolveCallback(response.data.file.urls);
        }
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  regularCheckingExportStatus(exportId: string): Promise<exportedFilesArray> {
    const intervalMinute = process.env.NODE_ENV === "test" ? 0.01 : 1;
    const intervalMilliseconds = intervalMinute * 60 * 1000;

    return new Promise((resolve, reject) => {
      this.interval = setInterval(() => {
        this.checkExport(exportId, resolve, reject);
      }, intervalMilliseconds);
    });
  }

  downloadFiles(files: string[], output: (data: any) => void) {
    return async.forEachLimit(files, 1, (data, next) => {
      this.api
        .downloadResultFile(data)
        .then(output)
        .then(() => next());
    });
  }
}

export default ApiController;
