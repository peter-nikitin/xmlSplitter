// пример текстов https://github.com/autovance/ftp-srv/blob/master/test/index.spec.js

import sinon from "sinon";
import fs from "fs";

import FtpModel from "../models/FtpModel";
import MockFtp from "../../__mocks__/mockFtpServer";
import sinonStubs from "../../__mocks__/sinonStubs";

const settings = {
  taskName: "ftpModel-test",
  outputPath: "ftpModel",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

describe("FtpModel", () => {
  const clientDirectory = `${process.cwd()}/test_tmp`;
  const mockFtp = new MockFtp(clientDirectory, settings.taskName);
  let client: FtpModel;

  const sandbox = sinon.createSandbox();

  beforeAll(async () => {
    sinonStubs(sandbox, "8801");
    mockFtp.startServer({
      url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
    });
    client = new FtpModel();
    await client.init();
  });

  afterAll(async () => {
    await client.destroy();
    sandbox.restore();
    mockFtp.server.close();
  });

  describe("init", () => {
    it("should connect to server", async () => {
      expect(client.ftpStatus).toBe("CONNECTED");
    });
  });

  describe("Working with files ", () => {
    afterEach(() => {
      if (fs.existsSync(`${clientDirectory}/uploadedFile.txt`)) {
        fs.unlinkSync(`${clientDirectory}/uploadedFile.txt`);
      }
    });

    it("should return list of files", async (done) => {
      fs.writeFile(`${clientDirectory}/test.txt`, "test string", (err) => {
        if (err) {
          throw err;
        }
      });
      fs.writeFile(`${clientDirectory}/test1.txt`, "test string", (err) => {
        if (err) {
          throw err;
        }
      });

      const files = await client.listDir("/");

      expect(files.length).toBeGreaterThan(0);
      done();
    });

    it("should upload the file", async (done) => {
      await client.uploadFile("/uploadedFile.txt", "test strings");
      const fileOnFtp = await client.listDir("/");

      expect(
        fileOnFtp.filter((file) => file === "uploadedFile.txt").length
      ).toBe(1);
      done();
    });
  });

  describe("Rejections", () => {
    jest.setTimeout(30000);

    it("should throw error when ftp is turned-off", async () => {
      mockFtp.server.close();
      await client.destroy();
      try {
        await client.init();
      } catch (error) {
        expect(error.toString()).toBe(
          "Error: connect ECONNREFUSED 127.0.0.1:8801"
        );
      }
    });
  });
});
