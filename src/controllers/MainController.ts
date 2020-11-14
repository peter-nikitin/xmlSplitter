import ApiController from "./ApiController";
import FtpModel from "../models/FtpModel";
import { Settings, ExportRange } from "../declare/types.d";
import SplitterModel from "../models/SplitterModel";

class MainController {
  private ftp: FtpModel = new FtpModel();
  private api: ApiController;
  private splitter: SplitterModel;
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
    this.api = new ApiController(settings);
    this.splitter = new SplitterModel(settings);
  }

  async exportAndUpload(range?: ExportRange) {
    const outputAfterSplitting = (data: any, chunkNumber: number) =>
      this.ftp.uploadFile(
        `/${this.settings.outputPath}/${
          this.settings.taskName
        }-${chunkNumber}-${(Math.random() * 1000).toFixed()}.xml`,
        data
      );

    const handleDownloadedFile = (response: NodeJS.ReadStream) => {
      return this.splitter.splitFile(response, outputAfterSplitting);
    };

    try {
      const status = await this.ftp.init();
      const files = await this.api.exportData(range);
      return this.api.downloadFiles(files, handleDownloadedFile);
    } catch (err) {
      return console.log(err);
    }
  }
}

export default MainController;
