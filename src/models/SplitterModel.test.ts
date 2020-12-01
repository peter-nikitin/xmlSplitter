import sinon from "sinon";
import fs from "fs";
import MemoryStream from "memorystream";
import path from "path";
import dotenv from "dotenv";

import SplitterModel from "./SplitterModel";
import { mocksXmlString } from "../../__mocks__/mock-xml-string";
import FtpModel from "./FtpModel";
import MockFtp from "../../__mocks__/mockFtpServer";
import sinonStubs from "../../__mocks__/sinonStubs";

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

const clientDirectory = `${process.cwd()}/test_tmp`;
afterAll(() => {
  MockFtp.clearDir(`${clientDirectory}/${settings.outputPath}`);
});

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
      mockOutput
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
      mockOutput
    );

    expect(resultData).toBe(mocksXmlString);
  });
});

describe("splitter + ftp", () => {
  let client: FtpModel;
  let sandbox: sinon.SinonSandbox;
  let mockFtp: MockFtp;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sinonStubs(sandbox, "8806");

    mockFtp = new MockFtp(clientDirectory, settings.taskName);
    MockFtp.checkTestDir(`${clientDirectory}/${settings.outputPath}`);
    mockFtp.startServer({
      url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
    });
  });

  afterAll(async () => {
    await client.destroy();
    await mockFtp.server.close();
    sandbox.restore();
  });

  it("should upload files to FTP", async (done) => {
    jest.setTimeout(30000);
    const splitter = new SplitterModel({ ...settings, itemsPerChunk: 1 });
    client = new FtpModel();
    const mockReadableStream = fs.createReadStream(
      path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
    );

    const outputAfterSplitting = (data: any, chunkNumber: number) =>
      client.uploadFile(
        `/${settings.outputPath}/${settings.taskName}-${chunkNumber}-${(
          Math.random() * 1000
        ).toFixed()}.xml`,
        data
      );

    await client.init();

    const result = await splitter.splitFile(
      mockReadableStream,
      outputAfterSplitting
    );
    setTimeout(() => {
      expect(
        fs.readdirSync(`${clientDirectory}/${settings.outputPath}`).length
      ).toBe(5);
      done();
    }, 4000);
  });
});
