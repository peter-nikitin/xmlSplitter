const express = require("express");

const router = express.Router();

const db = require("../db");

/* GET users listing. */
router.get("/:operation", function (req, res) {
  res.json(db.getLogs(req.params.operation));
});

module.exports = router;
