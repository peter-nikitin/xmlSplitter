export type Settings = {
  taskName: string;
  operationName: string;
  exportPeriodHours: number;
  cronTimerString: string;
  inputPath: string;
  outputPath: string;
  tagName: string;
  itemsPerChunk: number;
};
