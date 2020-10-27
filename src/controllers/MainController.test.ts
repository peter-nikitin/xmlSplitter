import axios from "axios";
import MainController from "./MainController";
import bunyan from "bunyan";
import FtpServer from "ftp-srv";
import sinon from "sinon";
import { config as dotEndConfig } from "dotenv";
import fs from "fs";
import path from "path";

const settings = {
  taskName: "customers-test",
  outputPath: "test",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

jest.mock("axios");

describe("exportAndUpload", () => {
  const logger = bunyan.createLogger({ name: "test-ftp" });
  const clientDirectory = `${process.cwd()}/test_tmp`;
  let main: MainController;

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
  dotEndConfig();

  beforeAll(() => {
    sandbox.stub(process.env, "FTP_HOST").value("127.0.0.1");
    sandbox.stub(process.env, "FTP_USER").value("test");
    sandbox.stub(process.env, "FTP_PASS").value("test");
    sandbox.stub(process.env, "FTP_PORT").value("8802");
    startServer({
      url: `ftp://${process.env.FTP_HOST}:${process.env.FTP_PORT}`,
    });
  });

  beforeAll(async () => {
    main = new MainController(settings);
  });

  afterAll(async () => {
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

  it("should invoke mock function with proper arguments", async () => {
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

    await main.exportAndUpload();
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
