import ApiController from "./ApiController";
import moment from "moment";
import mockAxios from "axios";

const settings = {
  taskName: "customers-test",
  outputPath: "test",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

const mockAnswerNotReady = {
  status: 200,
  data: {
    status: "Success",
    file: {
      processingStatus: "NotReady",
    },
  },
};

const mockAnswerReady = {
  status: 200,
  data: {
    status: "Success",
    file: {
      processingStatus: "Ready",
      urls: ["asdf", "det"],
    },
  },
};

const mockExportTaskId = {
  status: 200,
  data: {
    status: "Success",
    exportId: "123",
  },
};

const range = {
  sinceDateTimeUtc: moment().subtract(1, "day"),
  tillDateTimeUtc: moment(),
};

describe("checkExport", () => {
  it("should call api checkExport method", () => {
    const api = new ApiController(settings);

    const resolve = jest.fn();
    const reject = jest.fn();

    api.api.axios.post = jest.fn().mockResolvedValueOnce(mockAnswerNotReady);

    api.checkExport("123", resolve, reject);
    expect(api.api.axios.post).toHaveBeenCalledTimes(1);
  });

  it("should return string array", async () => {
    const api = new ApiController(settings);

    const resolve = jest.fn();
    const reject = jest.fn();

    api.api.axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.checkExport("123", resolve, reject);
    expect(resolve).toHaveBeenCalledWith(mockAnswerReady.data.file.urls);
  });

  it("should return string array", async () => {
    const api = new ApiController(settings);

    const resolve = jest.fn();
    const reject = jest.fn();

    api.api.axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.checkExport("123", resolve, reject);
    expect(resolve).toHaveBeenCalledWith(mockAnswerReady.data.file.urls);
  });
});

describe("regularCheckingExportStatus", () => {
  it("should return string array", async () => {
    const api = new ApiController(settings);
    jest.setTimeout(30000);

    api.api.axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);
    const result = await api.regularCheckingExportStatus("123");

    expect(result).toEqual(mockAnswerReady.data.file.urls);
  });

  it("should run 2 times and return string array", async () => {
    const api = new ApiController(settings);
    jest.setTimeout(30000);

    api.api.axios.post = jest
      .fn()
      .mockResolvedValueOnce(mockAnswerNotReady)
      .mockResolvedValueOnce(mockAnswerReady);
    const result = await api.regularCheckingExportStatus("123");

    expect(api.api.axios.post).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockAnswerReady.data.file.urls);
  });
});

describe("exportData", () => {
  it("should run with passed params", async () => {
    const api = new ApiController(settings);

    api.api.startExport = jest.fn().mockResolvedValueOnce(mockExportTaskId);

    api.api.axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.exportData(range);

    expect(api.api.startExport).toHaveBeenCalledWith(
      range.sinceDateTimeUtc.format("DD.MM.YYYY hh:MM:ss"),
      range.tillDateTimeUtc.format("DD.MM.YYYY hh:MM:ss")
    );
  });

  it("should run with default params", async () => {
    const api = new ApiController(settings);

    api.api.startExport = jest.fn().mockResolvedValueOnce(mockExportTaskId);

    api.api.axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.exportData();

    expect(api.api.startExport).toHaveBeenCalledWith(
      `${moment().subtract(1, "day").format("DD.MM.YYYY")} 23:00:00`,
      `${moment().format("DD.MM.YYYY")} 23:00:00`
    );
  });

  it("should return files array", async () => {
    const api = new ApiController(settings);

    api.api.axios.post = jest
      .fn()
      .mockResolvedValueOnce(mockExportTaskId)
      .mockResolvedValueOnce(mockAnswerReady);

    const result = await api.exportData();

    expect(result).toEqual(mockAnswerReady.data.file.urls);
  });
});
