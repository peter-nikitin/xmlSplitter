import Client from "ftp";

import { Settings } from "../declare/types.d";

const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED,",
};

class FtpController {
  settings: Settings;
  host: string | undefined;
  user: string | undefined;
  password: string | undefined;
  ftpClient: Client;
  ftpStatus: string;
  filesInFolder: string[];
  downloadedFiles: number;
  targetLocalFolder: string;

  constructor(settings: Settings) {
    this.settings = settings;
    this.host = process.env.FTP_HOST;
    this.user = process.env.FTP_USER;
    this.password = process.env.FTP_PASS;
    this.ftpClient = new Client();
    this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
    this.filesInFolder = [];
    this.downloadedFiles = 0;
    this.targetLocalFolder = "";
    this.init();
    this.uploadFile = this.uploadFile.bind(this);
  }

  init() {
    this.ftpClient.on("ready", () => {
      this.ftpStatus = FTP_STATUSES.CONNECTED;
    });

    this.ftpClient.connect({
      host: this.host,
      user: this.user,
      password: this.password,
      port: 33,
    });
  }

  destroy() {
    this.ftpClient.on("end", () => {
      this.ftpStatus = FTP_STATUSES.NOT_CONNECTED;
    });
    this.ftpClient.destroy();
  }

  uploadFile(pathOnFTP: string, file: any) {
    return new Promise((resolve, reject) => {
      this.ftpClient.append(file, pathOnFTP, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

export default FtpController;
