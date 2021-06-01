import express from "express";
import path from "path";

import db from "../db";

const logsRouter = express.Router();

logsRouter.get("/:operation", function (req, res) {
  res.json(db.getLogs(req.params.operation));
});

export default logsRouter;
