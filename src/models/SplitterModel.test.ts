import fs from "fs";
import MemoryStream from "memorystream";
import path from "path";

import SplitterModel from "./SplitterModel";
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

describe("updateValue", () => {
  it("should return updated value for first chunk", () => {
    const splitter = new SplitterModel(settings);

    const inputString = `<result><customers></result>`;
    const expectedUpdatedString = `<result><customers></customers></result>`;

    const updatedString = splitter.updateValue(inputString);

    expect(updatedString).toBe(expectedUpdatedString);
  });
  it("should return updated value for second chunk", () => {
    const splitter = new SplitterModel(settings);
    splitter.chunkNumber = 2;
    const inputString = `<result></result>`;
    const expectedUpdatedString = `<result><customers></customers></result>`;

    const updatedString = splitter.updateValue(inputString);

    expect(updatedString).toBe(expectedUpdatedString);
  });
});

describe("splitFile", () => {
  const memoryStream = new MemoryStream();
  const mockCallback = jest.fn();

  it("should return right number of files", async () => {
    const mockReadableStream = fs.createReadStream(
      path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
    );

    const settingsForSmallChunks = {
      taskName: "customers-test",
      outputPath: "test",
      tagName: "customer",
      itemsPerChunk: 1,
      operationName: "TestovyjEksportKlientov",
      exportPeriodHours: 24,
      cronTimerString: "0 03 19 * * *",
    };

    const splitter = new SplitterModel(settingsForSmallChunks);
    const resultData: string[] = [];

    const mockOutput = (data: any, chunkNumber: number) => {
      resultData.push(data);
    };

    const resultedFile = await splitter.splitFile(
      mockReadableStream,
      mockOutput,
      mockCallback
    );

    expect(resultData.length).toBe(5);
  });

  it("should return file with same length", async () => {
    const mockReadableStream = fs.createReadStream(
      path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
    );
    const splitter = new SplitterModel(settings);
    let resultData = ``;

    const mockOutput = (data: any, chunkNumber: number) => {
      resultData += data;
    };
    const resultedFile = await splitter.splitFile(
      mockReadableStream,
      mockOutput,
      mockCallback
    );

    expect(resultData).toBe(mocksXmlString);
  });
});
