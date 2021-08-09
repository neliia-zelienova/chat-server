var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');


var usersRouter = require('./routes/users');

var app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger(formatsLogger));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ status: "error", code: 404, message: "Not found" });
});

app.use((err, req, res, next) => {
  const code = err.status || 500;
  const status = err.status ? "error" : "fail";
  res.status(code).json({ status, code, message: err.message });
});

module.exports = app;
