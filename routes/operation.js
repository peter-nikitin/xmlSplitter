const express = require("express");

const router = express.Router();
const CronController = require("../controllers/CronController");

const db = require("../db/index");

router.get("/", (req, res) => {
  res.json(db.getOperations());
});

router.get("/:operation", (req, res) => {
  res.json(CronController.getCronJob(req.params.operation));
});

router.post("/", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    db.saveOperation(req.body);
    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

router.put("/", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    db.updateOperation(req.body);
    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

router.delete("/:operation", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    db.removeOperation(req.params.operation);
    console.log(req.params.operation);

    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

module.exports = router;
