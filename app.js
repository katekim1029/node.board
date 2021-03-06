const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const history = require("connect-history-api-fallback");
const cors = require("cors");
const dotenv = require("dotenv");

const db = require("./models");
const passport = require("passport");
const passportConfig = require("./passport");
const session = require("express-session");

const app = express();

// var indexRouter = require('./routes/index');
var apiRouter = require("./routes/api");
var userRouter = require("./routes/user");
var postRouter = require("./routes/post");

var corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true,
};

dotenv.config();
db.sequelize.sync();
passportConfig();

// User.sync() - This creates the table if it doesn't exist (and does nothing if it already exists)
// User.sync({ force: true }) - This creates the table, dropping it first if it already existed

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

console.log("##############app.js##############");

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// app.use('/', indexRouter);
app.use("/api", apiRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);

app.use(history());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "uploads")));

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
