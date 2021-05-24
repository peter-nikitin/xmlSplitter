import Client from "ftp";

import { FtpSettings } from "src/@types";

const FTP_STATUSES = {
  CONNECTED: "CONNECTED",
  NOT_CONNECTED: "NOT_CONNECTED",
};

const initFtp = async (
  ftpSettings: FtpSettings
): Promise<{
  destroy: () => Promise<string>;
  ftpStatus: string;
  uploadFile: (path: string, file: any) => Promise<void>;
}> => {
  const ftpClient = new Client();
  let ftpStatus = FTP_STATUSES.NOT_CONNECTED;

  const destroy = async (): Promise<string> => {
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

  const uploadFile = (path: string, file: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      ftpClient.append(file, path, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  };

  return new Promise((resolve) => {
    ftpClient.connect(ftpSettings);
    ftpClient.on("ready", () => {
      ftpStatus = FTP_STATUSES.CONNECTED;
      resolve({ ftpStatus, destroy, uploadFile });
    });

    ftpClient.on("error", (err) => {
      throw err;
    });
  });
};

export default initFtp;
