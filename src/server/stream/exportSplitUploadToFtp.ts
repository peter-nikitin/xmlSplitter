import {
  Settings,
  RequestSettings,
  ExportRange,
  FtpSettings,
} from "src/@types/index";

import startExportAndGetUrls from "./input/startExportAndGetUrls";
import downloadFile from "./input/downloadFile";

import splitXmlFile from "./modifications/splitXmlFile";

import ftp from "./output/ftp";

type createStreamType = {
  settings: Settings;
  requestSettings: RequestSettings;
  exportRange: ExportRange;
  ftpSettings: FtpSettings;
};

const exportSplitUploadToFtp = async ({
  settings,
  requestSettings,
  exportRange,
  ftpSettings,
}: createStreamType) => {
  const files = await startExportAndGetUrls({
    ...requestSettings,
    ...exportRange,
  });

  const ftpConnection = await ftp(ftpSettings);

  const uploadChunk = async (file: string, chunkNumber: number) => {
    const path = `/${settings.outputPath}/${
      settings.taskName
    }-${chunkNumber}-${(Math.random() * 1000).toFixed()}.xml`;

    await ftpConnection.uploadFile(path, file);
  };

  if (files && files.length) {
    for await (let file of files) {
      const downloadingFileStream = await downloadFile(file);
      splitXmlFile(downloadingFileStream, uploadChunk, settings);
    }
  }
};

export default exportSplitUploadToFtp;
