require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
const bcrypt = require("bcrypt");
const { authenticateToken, generateAccessToken } = require("./jwt");
var logger = require("morgan");
const {
  connectDb,
  models: { User, Inquiry, Subject },
} = require("./models");
connectDb();

var app = express();
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
app.get("/subject", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const subject = await Subject.findOne({}).exec();
  res.send(subject);
});
app.post("/subject", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const subject = await new Subject({ name }).save();
  console.log("POST!", subject);
  res.send(subject);
});
app.delete("/subject", authenticateToken, async (req, res) => {
  const { name } = req.body;
  await subjec.deleteOne({ name }).exec();

  res.send("OK!");
});
// app.post("/login", async (req, res) => {
//   const { email, password} = req.body;
//   const user = await User.findOne({ email,password }).exec();
//   res.send(user);
// });
// app.post("/register", async (req, res) => {
//   const { email, password,firstName,lastName,profession,phone,city,isExpert,expertDetails:{helpKind,inquirySubjects,questionsBeforeMeeting,lengthMeeting,preferredMeetingType,meetingAddress}} = req.body;
//   console.log("email, password: ", email, password);
//   const user = await new User({email, password,firstName,lastName,profession,phone,city,isExpert,expertDetails:{helpKind,inquirySubjects,questionsBeforeMeeting,lengthMeeting,preferredMeetingType,meetingAddress}}).save();
//   res.send(user);
// });
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = bcrypt.hashSync(password, salt);
    const existing = await (await User.findOne({ email: req.email })).exec();
    if (!exisitng) {
      res.sendStatus(403);
      return;
    }

    const { _id } = await new User({
      email,
      password: hash,
    }).save();
    const token = generateAccessToken(_id);
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
  const { _id } = await User.findOne({ email }).exec();
  const token = generateAccessToken({ _id });

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) throw Error("user not valid");
  const objectUser = user.toObject();
  objectUser.token = token;
  res.send(objectUser);
});

app.post("/inquiry", authenticateToken, async (req, res) => {
  const { idUser, title, explanation, inquirySubjects, status } = req.body;
  const inquiry = await new Inquiry({
    idUser,
    title,
    explanation,
    inquirySubjects,
    status,
  }).save();
  res.send(inquiry);
});

app.get("/inquiry", authenticateToken, async (req, res) => {
  const { _id } = req.body;
  const inquiry = await Inquiry.findOne({ _id }).exec();
  res.send(inquiry ?? {});
});
app.get("/inquiry", authenticateToken, async (req, res) => {
  const { idUser } = req.body;
  const inquiries = await Inquiry.find({ idUser }).exec();
  res.send(inquiries ?? {});
});

app.get("/hi", authenticateToken, (req, res) => {
  res.send("hello awsome team number 1!");
});
app.use(function (req, res, next) {
  next(createError(404));
});

if (process.env.TEST) {
  app.get("/deleteall", (req, res) => {
    /// delete all data
    User.deleteMany();
    res.ok();
  });
}

if (!process.env.TEST)
  app.listen(process.env.PORT, () => {
    console.log("Opened port succesfully at port " + process.env.PORT);
  });

module.exports = app;
