import Client from "ftp";

import { Settings } from "../declare/types";

const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED,",
};

class FtpController {
  private settings: Settings;
  private host: string | undefined;
  private user: string | undefined;
  private password: string | undefined;
  ftpClient: Client;
  ftpStatus: string;

  constructor(settings: Settings) {
    this.settings = settings;
    this.host = process.env.FTP_HOST;
    this.user = process.env.FTP_USER;
    this.password = process.env.FTP_PASS;
    this.ftpClient = new Client();
    this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
    this.uploadFile = this.uploadFile.bind(this);
  }

  init() {
    return new Promise((resolve, reject) => {
      this.ftpClient.on("ready", () => {
        this.ftpStatus = FTP_STATUSES.CONNECTED;
        resolve(this.ftpStatus);
      });

      this.ftpClient.on("error", (err) => {
        reject(err);
      });

      this.ftpClient.connect({
        host: this.host,
        user: this.user,
        password: this.password,
      });
    });
  }

  destroy() {
    return new Promise((resolve, reject) => {
      this.ftpClient.on("end", () => {
        this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
        resolve(this.ftpStatus);
      });
      this.ftpClient.on("error", (err) => {
        reject(err);
      });

      this.ftpClient.destroy();
    });
  }

  uploadFile(pathOnFTP: string, file: any) {
    return new Promise((resolve, reject) => {
      this.ftpClient.append(file, pathOnFTP, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

export default FtpController;
