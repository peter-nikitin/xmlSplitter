import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

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
    axiosRetry(axios, { retries: 5 });
  }

  startExport(
    sinceDateTimeUtc: string,
    tillDateTimeUtc: string
  ): Promise<AxiosResponse<ExportStarted>> {
    return axios
      .post(
        `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.settings.operationName}`,
        {
          sinceDateTimeUtc: sinceDateTimeUtc,
          tillDateTimeUtc: tillDateTimeUtc,
        },
        {
          timeout: 60000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Mindbox secretKey="${this.secretKey}"`,
          },
        }
      )
      .then((response) => response.data);
  }

  checkExportResult(taskID: string) {
    return axios
      .post(
        `https://api.mindbox.ru/v3/operations/sync?endpointId=${this.endpoint}&operation=${this.settings.operationName}`,
        {
          exportId: taskID,
        },
        {
          timeout: 60000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Mindbox secretKey="${this.secretKey}"`,
          },
        }
      )
      .then((response) => response.data);
  }

  downloadResultFile(url: string) {
    return axios
      .get(url, {
        responseType: "stream",
      })
      .then((response) => response.data);
  }
}

export default ApiModel;
