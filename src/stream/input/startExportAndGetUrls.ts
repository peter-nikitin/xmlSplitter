import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { resolve } from "path";

import {
  StartExportRequest,
  ExportStartedResponse,
  CheckExportRequest,
  ExportStatusResponse,
} from "../../types";

axiosRetry(axios, { retries: 5 });

const startExport = async ({
  endpointId,
  operation,
  secretKey,
  sinceDateTimeUtc,
  tillDateTimeUtc,
}: StartExportRequest) => {
  const response = await axios.post<ExportStartedResponse>(
    `https://api.mindbox.ru/v3/operations/sync`,
    {
      sinceDateTimeUtc,
      tillDateTimeUtc,
    },
    {
      timeout: 60000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${secretKey}"`,
      },
      params: {
        endpointId,
        operation,
      },
    }
  );

  if (response.data.status !== "Success") throw "Start export ERROR";

  return response.data.exportId;
};

const checkExportStatus = async ({
  endpointId,
  exportId,
  operation,
  secretKey,
}: CheckExportRequest) => {
  const response = await axios.post<ExportStatusResponse>(
    `https://api.mindbox.ru/v3/operations/sync`,
    {
      exportId,
    },
    {
      timeout: 60000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Mindbox secretKey="${secretKey}"`,
      },
      params: {
        endpointId,
        operation,
      },
    }
  );
  return response.data;
};

const startExportAndGetUrls = async (
  startExportParams: StartExportRequest
): Promise<[string]> => {
  const exportId = await startExport(startExportParams);

  const intervalMinute = 1;
  const intervalMilliseconds = intervalMinute * 60 * 1000;

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const exportStatus = await checkExportStatus({
        ...startExportParams,
        exportId,
      });

      if (exportStatus.file.processingStatus === "Ready") {
        clearInterval(interval);
        resolve(exportStatus.file.urls);
      }
    }, intervalMilliseconds);
  });
};

export default startExportAndGetUrls;
