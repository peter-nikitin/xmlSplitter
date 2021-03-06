const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");

const indexRouter = require("./routes/index");
const logsRouter = require("./routes/logs");
const operationRouter = require("./routes/operation");
const executeRouter = require("./routes/execute");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./splitter-front/build")));
app.use(cors());
app.set("etag", false);

// app.use("/", indexRouter);
app.use("/operation", operationRouter);
app.use("/logs", logsRouter);
app.use("/execute", executeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
