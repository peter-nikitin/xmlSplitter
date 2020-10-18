import express from "express";
import path from "path";

const router = express.Router();

/* GET home page. */
const indexRoute = router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "../splitter-front/build/index.html"));
});

export default indexRoute;
