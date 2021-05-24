import Client from "ftp";

import { FtpSettings } from "../../types";

const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED,",
};

const initFtp = async (ftpSettings: FtpSettings) => {
  const ftpClient = new Client();
  let ftpStatus = FTP_STATUSES.NOT_CONNECTED;

  ftpClient.on("ready", () => {
    ftpStatus = FTP_STATUSES.CONNECTED;
  });

  ftpClient.on("error", (err) => {
    throw err;
  });

  ftpClient.connect(ftpSettings);

  const destroy = async () => {
    return new Promise((resolve, reject) => {
      ftpClient.on("end", () => {
        ftpStatus = FTP_STATUSES.NOT_CONNECTED;
        resolve(ftpStatus);
      });
      ftpClient.on("error", (err) => {
        reject(err);
      });

      ftpClient.destroy();
    });
  };

  const uploadFile = (path: string, file: any) => {
    return new Promise<void>((resolve, reject) => {
      ftpClient.append(file, path, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  };

  return {
    destroy,
    uploadFile,
  };
};

export default initFtp;
