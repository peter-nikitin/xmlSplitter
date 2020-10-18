import express from "express";
import path from "path";

const router = express.Router();

import db from "../db";

/* GET users listing. */
const logsRoute = router.get("/:operation", function (req, res) {
  res.json(db.getLogs(req.params.operation));
});

export default logsRoute;
