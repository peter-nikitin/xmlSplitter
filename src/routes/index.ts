import express from "express";
import path from "path";

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get("/", function (req, res, next) {
  // res.send("hello");
  res.sendFile(path.join(__dirname, "../../splitter-front/build/index.html"));
});

export default indexRouter;
