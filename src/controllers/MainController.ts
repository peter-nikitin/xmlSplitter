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
    this.handleDownloadedFile = this.handleDownloadedFile.bind(this);
    this.outputAfterSplitting = this.outputAfterSplitting.bind(this);
  }

  outputAfterSplitting(data: any, chunkNumber: number) {
    return this.ftp.uploadFile(
      `/${this.settings.outputPath}/${this.settings.taskName}-${chunkNumber}-${(
        Math.random() * 1000
      ).toFixed()}.xml`,
      data
    );
  }

  handleDownloadedFile(response: NodeJS.ReadStream) {
    return this.splitter.splitFile(response, this.outputAfterSplitting);
  }

  async exportAndUpload(range?: ExportRange) {
    try {
      await this.ftp.init();
      const files = await this.api.exportData(range);
      return this.api.downloadFiles(files, this.handleDownloadedFile);
    } catch (err) {
      return console.log(err);
    }
  }
}

export default MainController;
