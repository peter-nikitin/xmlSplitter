import axios, { AxiosInstance, AxiosResponse } from "axios";

import { Settings } from "../declare/types.d";

type ExportStarted = {
  status: "Success";
  exportId: string;
};

class ApiModel {
  private endpoint: string | undefined = process.env.ENDPOINT;
  private secretKey: string | undefined = process.env.SECRET_KEY;
  private settings: Settings;
  url: string;
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

  startExport(
    sinceDateTimeUtc: string,
    tillDateTimeUtc: string
  ): Promise<AxiosResponse<ExportStarted>> {
    return this.axios.post("", {
      sinceDateTimeUtc: sinceDateTimeUtc,
      tillDateTimeUtc: tillDateTimeUtc,
    });
  }

  checkExportResult(taskID: string) {
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
