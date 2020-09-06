const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

class DbController {
  constructor(file) {
    this.file = file;
    this.adapter = new FileSync(file);
    this.db = low(this.adapter);
    this.init();
  }

  init() {
    this.db
      .defaults({
        operations: [
          {
            NAME: "customers",
            OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
            TAG_NAME: "customer",
            ITEMS_PER_CHUNCK: 50000,
            OPERATION_NAME: "exportSegmentsPart3",
            EXPORT_PERIOD_HOURS: 24,
            CRON_TIME: "0 39 18 * * *",
          },
          {
            NAME: "customers-merges",
            OUTPUT_FOLDER_NAME_ON_FTP: "test-chuncks",
            TAG_NAME: "customerAction",
            ITEMS_PER_CHUNCK: 50000,
            OPERATION_NAME: "TestExportDeduplications",
            EXPORT_PERIOD_HOURS: 24,
            CRON_TIME: "0 39 18 * * *",
          },
        ],
        customers: [],
        "customers-merges": [],
      })
      .write();
  }

  getOperations() {
    return this.db.get("operations").value();
  }

  updateOperation(operation) {
    this.db
      .get("operations")
      .find({ NAME: operation.NAME })
      .asign({ operation })
      .write();
  }

  removeOperation(operation) {
    this.db.get("operations").remove({ NAME: operation }).write();

    this.db.unset(operation).write();
  }

  getLogs(operation) {
    return this.db.get(operation).sortBy("date").take(10).value();
  }

  saveOperation(operation) {
    this.db.get("operations").push(operation).write();
    this.db.set(operation.NAME, []).write();
  }

  saveLogs(operationName, log) {
    this.db.get(operationName).push(log).write();
  }
}

module.exports = DbController;
