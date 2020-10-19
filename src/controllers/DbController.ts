import low, { lowdb } from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { Settings } from "../declare/types.d";

interface Logs {
  operation: string;
  date: Date;
  data: string;
}

interface LowDBSchema {
  operations: Settings[];
  logs: Logs[];
}

class DbController {
  adapter: typeof FileSync;
  db: low.LowdbSync<LowDBSchema>;
  file: string;

  constructor(file: string) {
    this.file = file;
    this.adapter = new FileSync(file);
    this.db = low(this.adapter);
    this.init();
  }

  init() {
    this.db.defaults().write();
  }

  getOperations() {
    return this.db.get("operations").value();
  }

  updateOperation(operation: Settings) {
    this.db
      .get("operations")
      .find({ operationName: operation.operationName })
      .assign({ operation })
      .write();
  }

  removeOperation(operation: string) {
    this.db.get("operations").remove({ operationName: operation }).write();

    this.db.unset(operation).write();
  }

  getLogs(operation: string) {
    return this.db.get(operation).value();
  }

  saveOperation(operation: Settings) {
    this.db.get("operations").push(operation).write();
    this.db.set(operation.operationName, []).write();
  }

  saveLogs(logOperationName: string, log: Logs) {
    this.db
      .get("logs")
      .push({ ...log, operation: logOperationName })
      .write();
  }
}

export default DbController;
