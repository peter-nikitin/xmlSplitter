import axios from "axios";
import MainController from "./MainController";
import sinon from "sinon";

import { config as dotEndConfig } from "dotenv";
import fs from "fs";
import path from "path";

import FtpModel from "../models/FtpModel";
import MockFtp from "../../__mocks__/mockFtpServer";
import sinonStubs from "../../__mocks__/sinonStubs";

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

describe("exportAndUpload", () => {
  const clientDirectory = `${process.cwd()}/test_tmp`;
  const mockFtp = new MockFtp(clientDirectory, settings.taskName);

  const sandbox = sinon.createSandbox();

  sinonStubs(sandbox, "8803");
  mockFtp.startServer({
    url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
  });

  const main = new MainController(settings);

  it("should invoke mock function with proper arguments", async () => {
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

    try {
      await main.exportAndUpload();
      expect(axios.post).toHaveBeenCalledTimes(2);
    } catch (error) {
      console.log(error);
    }

    sandbox.restore();
    mockFtp.server.close();
  });
});
