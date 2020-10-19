import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";

import bodyParser from "body-parser";
import indexRouter from "./routes/index";
import logsRouter from "./routes/logs";
import operationRouter from "./routes/operation";
// import executeRouter from "./routes/execute";

config();

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../splitter-front/build")));
// app.use(cors());
// app.set("etag", false);

app.use("/", indexRouter);
app.use("/operation", operationRouter);
app.use("/logs", logsRouter);
// app.use("/execute", executeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (req, res) {
  // set locals, only providing error in development

  res.status(502);
  res.type("txt").send("Not found");

  // res.locals.message = err.message;
  // res.locals.error = req.app.get("env") === "development" ? err : {};
  // // render the error page
  // res.status(err.status || 500);
  // res.render("error");
});

export default app;
