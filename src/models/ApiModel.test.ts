import fs from "fs";
import MemoryStream from "memorystream";
import moment from "moment";
import path from "path";

import ApiModel from "./ApiModel";

import { mocksXmlString } from "../../__mocks__/mock-xml-string";

const settings = {
  taskName: "customers-test",
  outputPath: "test",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

const mockRequestBody = {
  sinceDateTimeUtc: `20.10.2020 23:00:00`,
  tillDateTimeUtc: `21.10.2020 23:00:00`,
};

describe("startExport", () => {
  it("should be with passed params", () => {
    const Api = new ApiModel(settings);

    Api.axios.post = jest.fn();

    Api.startExport(
      mockRequestBody.sinceDateTimeUtc,
      mockRequestBody.tillDateTimeUtc
    );

    expect(Api.axios.post).toHaveBeenCalledWith("", mockRequestBody);
  });

  it("should return value", async () => {
    const api = new ApiModel(settings);

    const apiAnswerMock = {
      status: 200,
      data: {
        status: "Success",
        exportId: "123",
      },
    };
    api.axios.post = jest.fn().mockResolvedValue(apiAnswerMock);

    const apiAnswer = await api.startExport(
      mockRequestBody.sinceDateTimeUtc,
      mockRequestBody.tillDateTimeUtc
    );

    expect(apiAnswer).toEqual(apiAnswerMock);
  });
});

describe("checkExportResult", () => {
  it("should be called with passed taskId", async () => {
    const api = new ApiModel(settings);

    const apiAnswerMock = {
      status: 200,
      data: {
        status: "Success",
        file: {
          processingStatus: "NotReady",
        },
      },
    };
    api.axios.post = jest.fn().mockResolvedValue(apiAnswerMock);

    const apiAnswer = await api.checkExportResult("123");

    expect(apiAnswer).toEqual(apiAnswerMock);
  });
});

describe("downloadResultFile", () => {
  const mockReadbleStream = fs.createReadStream(
    path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
  );

  const memoryStream = new MemoryStream();

  it("should return stream", () => {
    const api = new ApiModel(settings);

    const apiAnswerMock = {
      status: 200,
      data: mockReadbleStream,
    };
    api.axios.get = jest.fn().mockResolvedValue(apiAnswerMock);

    api
      .downloadResultFile("")
      .then((response) =>
        response.data.pipe(memoryStream).on("end", () => {
          console.log(memoryStream.toString());

          expect(memoryStream.toString()).toEqual(mocksXmlString);
        })
      )
      .catch((err) => console.log(err));
  });
});
