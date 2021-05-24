import low, { lowdb } from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { Settings } from "../types";

interface Logs {
  task: string;
  dataTime: Date;
  logString: string;
}

interface RangeForNextTick {
  taskName: string;
  sinceDateTime: string;
  tillDateTime: string;
}

interface DBSchema {
  tasks: Settings[];
  logs: Logs[];
  rangesForNextTick?: RangeForNextTick[];
}

class DbModel {
  private adapter: typeof FileSync;
  db: low.LowdbSync<DBSchema>;

  constructor(file: string) {
    this.adapter = new FileSync(file);
    this.db = low(this.adapter);
  }

  default(value: DBSchema) {
    this.db.defaults(value).write();
  }

  getAllTasks() {
    return this.db.get("tasks").value();
  }

  updateTask(task: Settings) {
    this.db
      .get("tasks")
      .find({ taskName: task.taskName })
      .assign({ ...task })
      .write();
  }

  removeTask(task: string) {
    this.db.get("tasks").remove({ taskName: task }).write();
  }

  addTask(task: Settings) {
    this.db.get("tasks").push(task).write();
  }

  getLogs(task: string) {
    return this.db
      .get("logs")
      .value()
      .filter((item) => item.task === task)
      .reverse();
  }

  getRangeForNextTick(taskName: string): RangeForNextTick {
    return this.db.get("rangesForNextTick").find({ taskName }).value();
  }

  setRangeForNextTick(taskName: string, newRange: RangeForNextTick): void {
    this.db
      .get("rangesForNextTick")
      .find({ taskName })
      .assign({ ...newRange })
      .write();
  }

  saveLog(task: string, log: string) {
    this.db
      .get("logs")
      .push({ logString: log, dataTime: new Date(), task: task })
      .write();
  }
}

export default DbModel;
