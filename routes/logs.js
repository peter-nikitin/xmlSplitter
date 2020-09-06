var express = require("express");
var router = express.Router();

const db = require("../db");

/* GET users listing. */
router.get("/:operation", function (req, res, next) {
  res.json(db.getLogs(req.params.operation));
});

module.exports = router;
