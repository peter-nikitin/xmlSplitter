import ApiController from "./ApiController";
import moment from "moment";
import axios from "axios";
import SplitterModel from "../models/SplitterModel";
import fs from "fs";
import path from "path";

jest.mock("axios");

const settings = {
  taskName: "apiController-test",
  outputPath: "apiController",
  tagName: "customer",
  itemsPerChunk: 1,
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

    axios.post = jest.fn().mockResolvedValueOnce(mockAnswerNotReady);

    api.checkExport("123", resolve, reject);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("should return string array", async () => {
    const api = new ApiController(settings);

    const resolve = jest.fn();
    const reject = jest.fn();

    axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.checkExport("123", resolve, reject);
    expect(resolve).toHaveBeenCalledWith(mockAnswerReady.data.file.urls);
  });

  it("should return string array", async () => {
    const api = new ApiController(settings);

    const resolve = jest.fn();
    const reject = jest.fn();

    axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.checkExport("123", resolve, reject);
    expect(resolve).toHaveBeenCalledWith(mockAnswerReady.data.file.urls);
  });
});

describe("regularCheckingExportStatus", () => {
  it("should return string array", async () => {
    const api = new ApiController(settings);
    jest.setTimeout(30000);

    axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);
    const result = await api.regularCheckingExportStatus("123");

    expect(result).toEqual(mockAnswerReady.data.file.urls);
  });

  it("should run 2 times and return string array", async () => {
    const api = new ApiController(settings);
    jest.setTimeout(30000);

    axios.post = jest
      .fn()
      .mockResolvedValueOnce(mockAnswerNotReady)
      .mockResolvedValueOnce(mockAnswerReady);
    const result = await api.regularCheckingExportStatus("123");

    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockAnswerReady.data.file.urls);
  });
});

describe("exportData", () => {
  it("should run with passed params", async () => {
    const api = new ApiController(settings);

    api.api.startExport = jest.fn().mockResolvedValueOnce(mockExportTaskId);

    axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.exportData(range);

    expect(api.api.startExport).toHaveBeenCalledWith(
      range.sinceDateTimeUtc.format("DD.MM.YYYY hh:MM:ss"),
      range.tillDateTimeUtc.format("DD.MM.YYYY hh:MM:ss")
    );
  });

  it("should run with default params", async () => {
    const api = new ApiController(settings);

    api.api.startExport = jest.fn().mockResolvedValueOnce(mockExportTaskId);

    axios.post = jest.fn().mockResolvedValueOnce(mockAnswerReady);

    await api.exportData();

    expect(api.api.startExport).toHaveBeenCalledWith(
      `${moment().subtract(1, "day").format("DD.MM.YYYY")} 23:00:00`,
      `${moment().format("DD.MM.YYYY")} 23:00:00`
    );
  });

  it("should return files array", async () => {
    const api = new ApiController(settings);

    axios.post = jest
      .fn()
      .mockResolvedValueOnce(mockExportTaskId)
      .mockResolvedValueOnce(mockAnswerReady);

    const result = await api.exportData();

    expect(result).toEqual(mockAnswerReady.data.file.urls);
  });
});

describe("downloadFiles", () => {
  it("should run times 2 times", async () => {
    jest.setTimeout(30000);
    const api = new ApiController(settings);

    const files = ["file1", "file2"];
    api.api.downloadResultFile = jest.fn().mockResolvedValue(true);
    const output = jest.fn().mockResolvedValue(true);

    await api.downloadFiles(files, output);

    expect(output).toHaveBeenCalledTimes(2);
  });
});

describe("e2e download -> split -> write", () => {
  it("splitter files should be in dir", async () => {
    jest.setTimeout(30000);
    const api = new ApiController(settings);

    const mockResponse = fs.createReadStream(
      path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
    );
    axios.get = jest.fn().mockResolvedValue(mockResponse);
    const splitter = new SplitterModel(settings);

    const mockWrite = (data: any, number: number) => {
      fs.writeFileSync(
        `${process.cwd()}/test_tmp/${settings.outputPath}/${
          settings.taskName
        }-${number}`,
        data
      );
    };

    const output = (response: any) => splitter.splitFile(response, mockWrite);

    await api.downloadFiles(["mockFile"], output);

    expect(
      fs.readdirSync(`${process.cwd()}/test_tmp/${settings.outputPath}`).length
    ).toBe(5);
  });
});
