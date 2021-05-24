import FtpModel from "./output/ftp";
import { Settings, RequestSettings, ExportRange, FtpSettings } from "../types";
import SplitterModel from "./modifications/splitXmlFile";

import startExportAndGetUrls from "./input/startExportAndGetUrls";
import downloadFile from "./input/downloadFile";

import splitXmlFile from "./modifications/splitXmlFile";

import ftp from "./output/ftp";

const exportSplitUploadToFtp = async (
  settings: Settings,
  requestSettings: RequestSettings,
  exportRange: ExportRange,
  ftpSettings: FtpSettings
) => {
  const files = await startExportAndGetUrls({
    ...requestSettings,
    ...exportRange,
  });

  if (files && files.length) {
    const ftpConnection = await ftp(ftpSettings);

    const uploadResult = async (file, chunkNumber) => {
      const path = `/${settings.outputPath}/${
        settings.taskName
      }-${chunkNumber}-${(Math.random() * 1000).toFixed()}.xml`;

      await ftpConnection.uploadFile(path, file);
    };

    for await (let file of files) {
      const downloadingFileStream = await downloadFile(file);
      splitXmlFile(downloadingFileStream, uploadResult(), settings);
    }
  }
};

export default exportSplitUploadToFtp;
