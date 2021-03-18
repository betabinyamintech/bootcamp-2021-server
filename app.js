const createError = require("http-errors");
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { authenticateToken, generateAccessToken } = require("./jwt");
const logger = require("morgan");

require("dotenv").config();

const {
  connectDb,
  models: { User },
} = require("./models");

connectDb().then(() => {
  console.log("connected to dataBase!");
});
const app = express();
const { usersRouter, tagsRouter, inquiriesRouter } = require("./routes");
const salt = 10;

app.use(cors());
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
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).exec();
  if (!user) {
    res.status(403).send("user not exist");
    return;
  }
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    res.status(403).send("invalid password");
    return;
  }
  const token = generateAccessToken(user);
  const userObject = user.toObject();
  const { password: removed, ...resUser } = userObject;
  res.send({ resUser, token });
});

app.use("/users", usersRouter);
app.use("/tags", tagsRouter);
app.use("/inquiries", inquiriesRouter);
app.use("/admin", require("./routes/admin"));

// only test can delete all data and other tools for testing
if (process.env.NODE_ENV === "test") {
  app.get("/deleteall", async (req, res) => {
    /// delete all data
    const response = await User.deleteMany();
    res.send("ok");
  });
}

module.exports = app;
