const createError = require("http-errors");
const express = require("express");
const bcrypt = require("bcrypt");
const { authenticateToken, generateAccessToken } = require("./jwt");
const logger = require("morgan");

require("dotenv").config();
console.log('env', process.env)

const {
  models: { User, Inquiry,  },
} = require("./models");
const app = express();
const { usersRouter,tagsRouter,inquiriesRouter } = require("./routes");
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

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = bcrypt.hashSync(password, salt);
    const existing = await User.findOne({ email }).exec();
    if (existing) {
      res.sendStatus(403);
      return;
    }

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

app.post("/setProfile", authenticateToken, async (req, res) => {
  try {
    const user = await new User(req.body).save();
    console.log(user);
    const objectUser = user.toObject();
    objectUser.token = token;
    res.send(objectUser);
  } catch (err) {
    res.send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).exec();
  console.log('/login get user for email: ', email, user);

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) throw Error("user not valid");
  const token = generateAccessToken(user);
  res.send({token});
});



app.get("/hi", authenticateToken, (req, res) => {
  const {_id}=req.user;
  res.send("hello id: "+_id);
});

app.use("/users", usersRouter);
app.use("/tags", tagsRouter);
app.use("/inquiries", inquiriesRouter);

// only test can delete all data and other tools for testing
if (process.env.NODE_ENV === 'test') {
  app.get("/deleteall", async (req, res) => {
    /// delete all data
    const response = await User.deleteMany();
    res.send("ok");
  });
}else  {
  // if this is not a test run the server
  app.listen(process.env.PORT, () => {
    console.log("Opened port succesfully at port " + process.env.PORT);
  });
}

module.exports = app;
