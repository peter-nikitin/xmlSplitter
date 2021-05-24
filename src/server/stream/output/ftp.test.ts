// пример текстов https://github.com/autovance/ftp-srv/blob/master/test/index.spec.js

import sinon from "sinon";
import fs from "fs";
import path from "path";

import Client from "ftp";

import initFtp from "./ftp";
import MockFtp from "src/__mocks__/mockFtpServer";
import sinonStubs from "src/__mocks__/sinonStubs";

const settings = {
  taskName: "ftpModel-test",
  outputPath: "ftpModel",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

const mockFtpSettings = {
  host: "127.0.0.1",
  password: "testPass",
  port: 8803,
  user: "testUser",
};

const clientDirectory = path.resolve(process.cwd(), "./src/__mocks__/test-ftp");
const mockFtp = new MockFtp(clientDirectory, settings.taskName);
let ftpConn: {
  ftpStatus: any;
  destroy: any;
  uploadFile: (path: string, file: any) => Promise<void>;
};

const sandbox = sinon.createSandbox();

beforeAll(async () => {
  sinonStubs(sandbox, `${mockFtpSettings.port}`);
  mockFtp.startServer({
    url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
  });
  ftpConn = await initFtp(mockFtpSettings);
});

afterAll(async () => {
  await ftpConn.destroy();
  sandbox.restore();
  mockFtp.server.close();
});

describe("FtpModel", () => {
  describe("init", () => {
    it("should connect to server", async () => {
      expect(ftpConn.ftpStatus).toBe("CONNECTED");
    });
  });

  describe("Working with files ", () => {
    afterEach(() => {
      if (fs.existsSync(`${clientDirectory}/uploadedFile.txt`)) {
        fs.unlinkSync(`${clientDirectory}/uploadedFile.txt`);
      }
    });

    it("should upload the file", async (done) => {
      await ftpConn.uploadFile("/uploadedFile.txt", "test strings");
      const fileOnFtp = mockFtp.listOfFiles(clientDirectory);

      expect(fileOnFtp.length).toBe(1);
      done();
    });
  });
});
