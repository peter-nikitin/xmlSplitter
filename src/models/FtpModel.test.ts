// пример текстов https://github.com/autovance/ftp-srv/blob/master/test/index.spec.js

import bunyan from "bunyan";
import FtpServer from "ftp-srv";
import sinon from "sinon";
import { config as dotEndConfig } from "dotenv";
import fs from "fs";

import FtpModel from "./FtpModel";

describe("FtpModel", () => {
  const logger = bunyan.createLogger({ name: "test-ftp" });
  const clientDirectory = `${process.cwd()}/test_tmp`;

  const checkTestDir = (path: string) => {
    if (!fs.existsSync(path)) {
      fs.mkdir(path, (err) => {
        throw err;
      });
    }
  };

  checkTestDir(clientDirectory);

  let connection;
  const sandbox = sinon.createSandbox();
  let server: FtpServer;
  let client: FtpModel;
  dotEndConfig();

  beforeAll(() => {
    sandbox.stub(process.env, "FTP_HOST").value("127.0.0.1");
    sandbox.stub(process.env, "FTP_USER").value("test");
    sandbox.stub(process.env, "FTP_PASS").value("test");
    sandbox.stub(process.env, "FTP_PORT").value("8802");
    startServer({
      url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
    });
    client = new FtpModel();
  });

  beforeAll(async () => {
    await client.init();
  });

  afterAll(async () => {
    await client.destroy();
    sandbox.restore();
    server.close();
  });

  const startServer = (options = {}) => {
    const server = new FtpServer({
      ...options,
      log: logger,
      pasv_url: "127.0.0.1",
      pasv_min: 8881,
      greeting: ["hello", "world"],
      anonymous: true,
    });

    server.on("login", (data, resolve) => {
      connection = data.connection;
      resolve({ root: clientDirectory });
    });

    server.on("client-error", (data) => {
      console.log(data);
    });

    return server.listen();
  };

  it("FtpModel init should connect to server", async () => {
    expect(client.ftpStatus).toBe("CONNECTED");
  });

  it("listDir should list files", async () => {
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

    expect(files).toEqual(["test.txt", "test1.txt"]);
  });

  describe("uploadFile", () => {
    afterEach(() => {
      fs.unlinkSync(`${clientDirectory}/uploadedFile.txt`);
    });
    it("should upload the file", async () => {
      await client.uploadFile("/uploadedFile.txt", "test strings");
      const fileOnFtp = await client.listDir("/");

      expect(
        fileOnFtp.filter((file) => file === "uploadedFile.txt").length
      ).toBe(1);
    });
  });
});
