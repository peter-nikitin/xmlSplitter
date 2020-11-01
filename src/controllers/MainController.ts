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
    try {
      const status = await this.ftp.init();
      const files = await this.api.exportData(range);
      this.api.downloadFiles(files, (response: any) =>
        this.splitter.splitFile(
          response.data,
          (data: any, chunkNumber: number) =>
            this.ftp.uploadFile(
              `/${this.settings.outputPath}/${this.settings.taskName}-${chunkNumber}`,
              data
            )
        )
      );
      return await this.ftp.destroy();
    } catch (err) {
      return console.log(err);
    }
  }
}

export default MainController;
