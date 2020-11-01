import fs from "fs";
import MemoryStream from "memorystream";
import moment from "moment";
import path from "path";
import axios from "axios";

import ApiModel from "./ApiModel";

import { mocksXmlString } from "../../__mocks__/mock-xml-string";

jest.mock("axios");

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

    axios.post = jest.fn();

    Api.startExport(
      mockRequestBody.sinceDateTimeUtc,
      mockRequestBody.tillDateTimeUtc
    );

    const expected = `https://api.mindbox.ru/v3/operations/sync?endpointId=undefined&operation=TestovyjEksportKlientov", ${mockRequestBody}, {"headers": {"Accept": "application/json", "Authorization": "Mindbox secretKey=\"undefined\"", "Content-Type": "application/json"}, "timeout": 60000}`;

    // expect(axios.post).toHaveBeenCalledWith(expected);

    // TODO: придумать как протестить то вызов запроса
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
    axios.post = jest.fn().mockResolvedValue(apiAnswerMock);

    const apiAnswer = await api.startExport(
      mockRequestBody.sinceDateTimeUtc,
      mockRequestBody.tillDateTimeUtc
    );

    expect(apiAnswer).toEqual(apiAnswerMock.data);
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
    axios.post = jest.fn().mockResolvedValue(apiAnswerMock);

    const apiAnswer = await api.checkExportResult("123");

    expect(apiAnswer).toEqual(apiAnswerMock.data);
  });
});

describe("downloadResultFile", () => {
  const mockReadableStream = fs.createReadStream(
    path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
  );

  const memoryStream = new MemoryStream();

  it("should return stream", () => {
    const api = new ApiModel(settings);

    const apiAnswerMock = {
      status: 200,
      data: mockReadableStream,
    };
    axios.get = jest.fn().mockResolvedValue(apiAnswerMock);

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
