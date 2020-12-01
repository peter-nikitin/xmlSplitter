import bunyan from "bunyan";
import FtpServer, { FtpConnection } from "ftp-srv";
import sinon from "sinon";
import { config as dotEndConfig } from "dotenv";
import fs from "fs";

class MockFtp {
  logger: bunyan;
  clientDirectory: string;

  static checkTestDir(path: string): void {
    if (!fs.existsSync(path)) {
      fs.mkdir(path, (err) => {
        throw err;
      });
    }
  }

  constructor(clientDirectory: string, serverName: string) {
    dotEndConfig();
    this.clientDirectory = clientDirectory;
    this.logger = bunyan.createLogger({ name: serverName });
  }
  connection: FtpConnection;
  sandbox = sinon.createSandbox();
  server: FtpServer;

  startServer(options = {}) {
    this.server = new FtpServer({
      ...options,
      log: this.logger,
      pasv_url: "127.0.0.1",
      pasv_min: 8881,
      greeting: ["hello", "world"],
      anonymous: true,
    });

    this.server.on("login", (data, resolve) => {
      this.connection = data.connection;
      resolve({ root: this.clientDirectory });
    });

    this.server.on("client-error", (data) => {
      console.log(data);
    });

    return this.server.listen();
  }
  static clearDir(path: string) {
    const files = fs.readdirSync(path);
    files.map((fileName) => fs.unlinkSync(`${path}/${fileName}`));
  }
}

export default MockFtp;
