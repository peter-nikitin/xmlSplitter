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
