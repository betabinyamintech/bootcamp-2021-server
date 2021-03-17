const createError = require("http-errors");
const express = require("express");
const bcrypt = require("bcrypt");
const { authenticateToken, generateAccessToken } = require("./jwt");
const logger = require("morgan");

require("dotenv").config();
console.log("env", process.env);

const {
  models: { User },
} = require("./models");
const app = express();
const { usersRouter, tagsRouter, inquiriesRouter } = require("./routes");
const salt = 10;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email)) {
      res.status(403).send("invalid email").end();
      return;
    }

    const existing = await User.findOne({ email }).exec();
    if (existing) {
      res.status(403).send("email already existing").end();
      return;
    }

    const hash = bcrypt.hashSync(password, salt);
    const user = await new User({
      email,
      password: hash,
    }).save();
    const token = generateAccessToken(user);
    res.send({ token });
  } catch (err) {
    res.send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).exec();

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    res.status(403).send("invalid password");
    return;
  }

  const token = generateAccessToken(user);
  res.send({ token });
});

app.use("/users", usersRouter);
app.use("/tags", tagsRouter);
app.use("/inquiries", inquiriesRouter);

// only test can delete all data and other tools for testing
if (process.env.NODE_ENV === "test") {
  app.get("/deleteall", async (req, res) => {
    /// delete all data
    const response = await User.deleteMany();
    res.send("ok");
  });
} else {
  // if this is not a test run the server
  app.listen(process.env.PORT, () => {
    console.log("Opened port succesfully at port " + process.env.PORT);
  });
}

module.exports = app;
