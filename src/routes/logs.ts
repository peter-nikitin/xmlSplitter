import express from "express";
import path from "path";

const logsRouter = express.Router();

import db from "../db";

/* GET users listing. */
logsRouter.get("/:operation", function (req, res) {
  res.json(db.getLogs(req.params.operation));
});

export default logsRouter;
