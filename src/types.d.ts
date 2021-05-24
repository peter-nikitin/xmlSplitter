import DbController from "../controllers/DbController";

export type Settings = {
  taskName: string;
  operationName: string;
  exportPeriodHours: number;
  cronTimerString: string;
  outputPath: string;
  tagName: string;
  itemsPerChunk: number;
};

export type LogsModel = DbController;

export type ExportRange = {
  sinceDateTimeUtc: Moment;
  tillDateTimeUtc: Moment;
};

export type ExportStartedResponse = {
  status: string;
  exportId: string;
};

export type ExportRange = {
  sinceDateTimeUtc: string;
  tillDateTimeUtc: string;
};

export type RequestSettings = {
  operation: string;
  endpointId: string;
  secretKey: string;
};

export type ExportId = {
  exportId: string;
};

export type ExportStatusResponse = {
  status: string;
  file: {
    processingStatus: "Ready" | "NotReady";
    urls: [string];
  };
};

export type StartExportRequest = RequestSettings & ExportRange;
export type CheckExportRequest = RequestSettings & ExportId;

export type FtpSettings = {
  host: string;
  user: string;
  password: string;
  port: number;
};
