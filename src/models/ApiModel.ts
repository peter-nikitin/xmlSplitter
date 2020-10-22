import axios, { AxiosInstance } from "axios";
import moment from "moment";

import { Settings } from "../declare/types.d";

class ApiModel {
  private endpoint: string | undefined = process.env.ENDPOINT;
  private secretKey: string | undefined = process.env.SECRET_KEY;
  private settings: Settings;
  axios: AxiosInstance;

  constructor(settings: Settings) {
    this.settings = settings;
    this.axios = axios.create({
      url: `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.settings.operationName}`,
      timeout: 60000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${this.secretKey}"`,
      },
    });
  }

  startExport(sinceDateTimeUtc?: string, tillDateTimeUtc?: string) {
    // используем переданные значения или считаем сами
    const tillDate =
      tillDateTimeUtc || `${moment().utc().format("DD.MM.YYYY")} 23:00:00`;
    const sinceDate =
      sinceDateTimeUtc ||
      `${moment()
        .subtract(this.settings.exportPeriodHours, "hours")
        .format("DD.MM.YYYY")} 23:00:00`;

    return this.axios.post("", {
      sinceDateTimeUtc: sinceDate,
      tillDateTimeUtc: tillDate,
    });
  }

  checkExportResult(taskID: number) {
    return this.axios.post("", {
      exportId: taskID,
    });
  }

  downloadResultFile(url: string) {
    return this.axios.get(url, {
      headers: {},
      responseType: "stream",
    });
  }
}

export default ApiModel;
