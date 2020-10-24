import Client from "ftp";

import { Settings } from "../declare/types";

const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED,",
};

class FtpModel {
  private host: string | undefined = process.env.FTP_HOST;
  private user: string | undefined = process.env.FTP_USER;
  private password: string | undefined = process.env.FTP_PASS;
  private port: number = +(process.env.FTP_PORT || 21);
  ftpClient: Client = new Client();
  ftpStatus: string = FTP_STATUSES.NOT_CONNECTED;

  constructor() {
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
        port: this.port,
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

  listDir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.ftpClient.list(path, (err, listing) => {
        if (err) {
          reject(err);
        }
        resolve(listing.map((file) => file.name) as string[]);
      });
    });
  }
}

export default FtpModel;
