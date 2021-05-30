import axios from "axios";
import sinon from "sinon";
import fs from "fs";
import path from "path";
import dotnev from "dotenv";
import moment from "moment";

import exportSplitUploadToFtp from "./exportSplitUploadToFtp";

import {
  Settings,
  RequestSettings,
  ExportRange,
  FtpSettings,
} from "src/@types/index";

import MockFtp from "../../__mocks__/mockFtpServer";
import sinonStubs from "../../__mocks__/sinonStubs";

dotnev.config();

jest.mock("axios");
// jest.useFakeTimers();
jest.setTimeout(300000);

const settings: Settings = {
  taskName: "cronController-test",
  outputPath: "cronController",
  tagName: "customer",
  itemsPerChunk: 1,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: `${moment().add(2, "second").format("ss mm HH")} * * *`,
};

const requestSettings: RequestSettings = {
  endpointId: "testEndpoint",
  secretKey: "testSecretKey",
  operation: "testOperation",
};
const exportRange: ExportRange = {
  sinceDateTimeUtc: "22.04.2021",
  tillDateTimeUtc: "23.04.2021",
};
const ftpSettings: FtpSettings = {
  host: "127.0.0.1",
  password: "testPass",
  port: 8807,
  user: "testUser",
};

const clientDirectory = path.resolve(
  process.cwd(),
  "./src/__mocks__/main_test"
);
const mockFtp = new MockFtp(clientDirectory, settings.taskName);
const sandbox = sinon.createSandbox();
const mockFile1 = fs.createReadStream(
  path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
);
const mockFile2 = fs.createReadStream(
  path.resolve(__dirname, "../../__mocks__/mock-xml.xml")
);

const mockResponse = {
  NotReady: {
    status: 200,
    data: {
      status: "Success",
      file: {
        processingStatus: "NotReady",
      },
    },
  },
  Ready: {
    status: 200,
    data: {
      status: "Success",
      file: {
        processingStatus: "Ready",
        urls: ["file1", "file2"],
      },
    },
  },
  StartExport: {
    status: 200,
    data: {
      status: "Success",
      exportId: "123",
    },
  },
  File1: {
    status: 200,
    data: mockFile1,
  },
  File2: {
    status: 200,
    data: mockFile2,
  },
  Rejected: {
    status: 503,
    data: "server unavailable",
  },
};

sinonStubs(sandbox, `${ftpSettings.port}`);

beforeAll(() => {
  mockFtp.startServer({
    url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
  });
  MockFtp.checkTestDir(`${clientDirectory}/${settings.outputPath}`);
  (axios.post as jest.Mock)
    .mockResolvedValueOnce(mockResponse.StartExport)
    .mockResolvedValueOnce(mockResponse.NotReady)
    .mockResolvedValueOnce(mockResponse.Ready);

  (axios.get as jest.Mock)
    .mockResolvedValueOnce(mockResponse.File1)
    .mockResolvedValueOnce(mockResponse.File2);
});

afterAll(async () => {
  MockFtp.clearDir(`${clientDirectory}/${settings.outputPath}`);
  sandbox.restore();
  mockFtp.server.close();
});

describe("main e2e test", () => {
  it("should split file by cron without custom range", async () => {
    try {
      await exportSplitUploadToFtp({
        exportRange,
        ftpSettings,
        requestSettings,
        settings,
      });
      await new Promise((r) => setTimeout(r, 2000));
      expect(axios.post).toHaveBeenCalledTimes(3);
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(
        fs.readdirSync(`${clientDirectory}/${settings.outputPath}`).length
      ).toBe(10);
    } catch (error) {
      console.log(error);
    }
  });
});
