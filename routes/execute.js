const express = require("express");
const router = express.Router();
const CronController = require("../controllers/CronController");

const db = require("../db/index");

router.post("/:operation", (req, res, next) => {
  CronController[req.params.operation].tick();
  res.status(200).send("start execution");
});

module.exports = router;
