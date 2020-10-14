const express = require("express");

const router = express.Router();
const CronController = require("../controllers/CronController");

router.post("/:operation", (req, res) => {
  CronController[req.params.operation].tick();
  res.status(200).send("start execution");
});

module.exports = router;
