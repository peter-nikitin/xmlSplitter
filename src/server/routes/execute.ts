import express from "express";
import path from "path";

import exportSplitUploadToFtp from "server/stream/exportSplitUploadToFtp";

const executeRouter = express.Router();

executeRouter.post("/:operation", (req, res) => {
  // CronController[req.params.operation].tick();
  res.status(200).send("start execution");
});

module.exports = executeRouter;
