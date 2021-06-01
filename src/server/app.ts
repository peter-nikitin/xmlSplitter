import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import { config } from "dotenv";

import bodyParser from "body-parser";
import indexRouter from "./routes/index";
import logsRouter from "./routes/logs";
import operationRouter from "./routes/operation";

config();

const app = express();

app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../splitter-front/build")));

app.use("/", indexRouter);
app.use("/operation", operationRouter);
app.use("/logs", logsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (req, res) {
  res.status(502);
  res.type("txt").send("Not found");
});

export default app;
