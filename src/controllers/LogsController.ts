import { LogsModel } from "../declare/types.d";

class LogsController {
  logsModel: LogsModel;

  constructor(logSaver: LogsModel) {
    this.logsModel = logSaver;
  }

  saveLogs(operation: string, logItem: string) {
    this.logsModel.saveLogs(operation, {
      logDateAndTime: logItem,
      logMessage: new Date(),
    });
  }
}
