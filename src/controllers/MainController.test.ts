import axios from "axios";
import MainController from "./MainController";
import sinon from "sinon";
import fs from "fs";
import path from "path";
import dotnev from "dotenv";

import FtpModel from "../models/FtpModel";
import MockFtp from "../../__mocks__/mockFtpServer";
import sinonStubs from "../../__mocks__/sinonStubs";

dotnev.config();

const settings = {
  taskName: "mainController-test",
  outputPath: "mainController",
  tagName: "customer",
  itemsPerChunk: 1,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

jest.mock("axios");

afterAll(() => {
  MockFtp.clearDir(`${process.cwd()}/test_tmp/${settings.outputPath}`);
});

const clientDirectory = `${process.cwd()}/test_tmp`;
const mockFtp = new MockFtp(clientDirectory, settings.taskName);

const sandbox = sinon.createSandbox();

sinonStubs(sandbox, "8803");
mockFtp.startServer({
  url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
});

const main = new MainController(settings);

afterAll(async () => {
  sandbox.restore();
  mockFtp.server.close();
});

describe("exportAndUpload", () => {
  it("should send 2 requests: start export and check", async (done) => {
    jest.setTimeout(30000);
    const fileResponseMock = fs.createReadStream(
      path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
    );
    mockFtp.checkTestDir(`${clientDirectory}/${settings.outputPath}`);

    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        data: {
          status: "Success",
          exportId: "123",
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          status: "Success",
          file: {
            processingStatus: "Ready",
            urls: ["asdf"],
          },
        },
      });

    axios.get = jest.fn().mockResolvedValue({
      status: 200,
      data: fileResponseMock,
    });

    await main.exportAndUpload();
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(
        fs.readdirSync(`${process.cwd()}/test_tmp/${settings.outputPath}`)
          .length
      ).toBe(5);
      done();
    }, 5000);
  });
});
