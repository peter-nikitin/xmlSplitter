import fs from "fs";
import { brotliDecompress } from "zlib";

import DbModel from "./DbModel";

// import low from "lowdb";
// import Memory from "lowdb/adapters/Memory";
// import FileSync from "lowdb/adapters/FileSync";

const pathToDbFile = `${process.cwd()}/__mocks__/testDb.json`;

let DB: DbModel;

const settings = {
  taskName: "customers-test",
  outputPath: "test",
  tagName: "customer",
  itemsPerChunk: 50000,
  operationName: "TestovyjEksportKlientov",
  exportPeriodHours: 24,
  cronTimerString: "0 03 19 * * *",
};

beforeAll(() => {
  DB = new DbModel(pathToDbFile);
});

beforeEach(() => {
  DB.default({ tasks: [], logs: [] });
});

afterEach(() => {
  fs.writeFileSync(pathToDbFile, "{}");
});

describe("DbModel init", () => {
  it("should init with default values", () => {
    expect(DB.db.getState()).toStrictEqual({ tasks: [], logs: [] });
  });
});

describe("Tasks ", () => {
  it("should write new task", () => {
    DB.addTask({ ...settings });

    expect(DB.db.get("tasks").value()[0]).toStrictEqual(settings);
  });

  it("should update task", () => {
    DB.addTask(settings);

    const settingsNew = {
      taskName: "customers-test",
      outputPath: "test1",
      tagName: "customer",
      itemsPerChunk: 50000,
      operationName: "TestovyjEksportKlientov",
      exportPeriodHours: 24,
      cronTimerString: "0 03 19 * * *",
    };

    DB.updateTask(settingsNew);

    expect(DB.db.get("tasks").value()[0].outputPath).toBe("test1");
  });

  it("should delete task", () => {
    DB.addTask(settings);
    DB.removeTask("customers-test");

    expect(DB.db.get("tasks").value().length).toBe(0);
  });

  it("should return all tasks", () => {
    DB.addTask(settings);
    DB.addTask(settings);

    expect(DB.getAllTasks()).toEqual([settings, settings]);
  });
});

describe("Logs", () => {
  it("should save log", () => {
    DB.addTask(settings);
    DB.saveLog(settings.taskName, "start");
    expect(DB.db.get("logs").value().length).toBe(1);
  });

  it("should return log", () => {
    DB.addTask(settings);
    DB.saveLog(settings.taskName, "start");
    expect(DB.getLogs(settings.taskName)[0].logString).toBe("start");
  });
});
