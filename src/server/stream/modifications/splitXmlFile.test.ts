import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import splitXmlFile, { replaceResultTag } from "./splitXmlFile";

dotenv.config();

const settings = {
  taskName: "splitModel-test",
  outputPath: "splitModel",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

afterAll(() => {
  // MockFtp.clearDir(`${clientDirectory}/${settings.outputPath}`);
});

const outputStream = jest.fn();

describe("updateValue", () => {
  it("should return updated value for first chunk", () => {
    const inputString = `<result><customers></result>`;
    const expectedUpdatedString = `<result><customers></customers></result>`;

    expect(replaceResultTag(inputString, settings.tagName, 0)).toBe(
      expectedUpdatedString
    );
  });
  it("should return updated value for second chunk", () => {
    const inputString = `<result></result>`;
    const expectedUpdatedString = `<result><customers></customers></result>`;

    expect(replaceResultTag(inputString, settings.tagName, 2)).toBe(
      expectedUpdatedString
    );
  });
});

describe("splitFile", () => {
  it("should return right number of files", async () => {
    const mockReadableStream = fs.createReadStream(
      path.resolve(__dirname, "../../../__mocks__/mock-xml.xml")
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

    const resultData: string[] = [];

    const mockOutput = (data: any, chunkNumber: number) => {
      resultData.push(data);
    };

    await splitXmlFile(mockReadableStream, mockOutput, settingsForSmallChunks);

    expect(resultData.length).toBe(5);
  });
});
