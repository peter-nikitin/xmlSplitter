import express from "express";
import path from "path";

const operationRouter = express.Router();
import CronController from "../cron/CronController";

import dbController from "../db/index";

operationRouter.get("/", (req, res) => {
  res.json(dbController.getAllTasks());
});

operationRouter.get("/:operation", (req, res) => {
  // res.json(
  //   CronController.tasks.filter(
  //     (task) => task.settings.operationName === req.params.operation
  //   )
  // );
});

operationRouter.post("/", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    dbController.addTask(req.body);
    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

operationRouter.put("/", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    dbController.updateTask(req.body);
    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

operationRouter.delete("/:operation", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    dbController.removeTask(req.params.operation);
    console.log(req.params.operation);

    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

export default operationRouter;
