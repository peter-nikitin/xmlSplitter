import axios from "axios";
import sinon from "sinon";
import fs from "fs";
import path from "path";
import dotnev from "dotenv";
import moment from "moment";

import MainController from "../controllers/MainController";
import CronController from "../controllers/CronController";

import MockFtp from "../../__mocks__/mockFtpServer";
import sinonStubs from "../../__mocks__/sinonStubs";

dotnev.config();

const settings = {
  taskName: "cronController-test",
  outputPath: "cronController",
  tagName: "customer",
  itemsPerChunk: 1,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: `${moment().add(2, "second").format("ss mm HH")} * * *`,
};

jest.mock("axios");

afterAll(() => {
  MockFtp.clearDir(`${process.cwd()}/test_tmp/${settings.outputPath}`);
});

const clientDirectory = `${process.cwd()}/test_tmp`;
const mockFtp = new MockFtp(clientDirectory, settings.taskName);

const sandbox = sinon.createSandbox();

sinonStubs(sandbox, "8805");
mockFtp.startServer({
  url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
});

const main = new MainController(settings);
MockFtp.checkTestDir(`${clientDirectory}/${settings.outputPath}`);

afterAll(async () => {
  sandbox.restore();
  mockFtp.server.close();
});

describe("main e2e test", () => {
  it("should split file by cron without custom range", async (done) => {
    jest.setTimeout(300000);
    const fileResponseMock = fs.createReadStream(
      path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
    );

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
      const cron = new CronController();
      cron.setCronJob(settings);

      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenCalledTimes(1);
      setTimeout(() => {
        expect(
          fs.readdirSync(`${process.cwd()}/test_tmp/${settings.outputPath}`)
            .length
        ).toBe(5);
        done();
      }, 10000);
    } catch (error) {
      console.log(error);
    }
  });
});
