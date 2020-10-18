import express from "express";
import path from "path";

const router = express.Router();
import CronController from "../controllers/CronController";

import dbController from "../db/index";

router.get("/", (req, res) => {
  res.json(dbController.getOperations());
});

router.get("/:operation", (req, res) => {
  res.json(CronController.getCronJob(req.params.operation));
});

router.post("/", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    dbController.saveOperation(req.body);
    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

router.put("/", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    dbController.updateOperation(req.body);
    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

router.delete("/:operation", (req, res) => {
  if (req.get("Authorization") === process.env.SECRET_KEY) {
    dbController.removeOperation(req.params.operation);
    console.log(req.params.operation);

    res.send("OK");
  } else {
    res.status(400).send("unAuthorize");
  }
});

module.exports = router;
