var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

router.use(authenticateToken, (req, res, next) => {
  if (!req.user.isAdmin) {
    res.sendStatus(403);
    return;
  }
  next();
});

router.get("/experts", async (req, res) => {
  const { name, tag } = req.query;
  console.log("req experts:", req.user);
  let experts = await User.find(
    { isExpert: true },
    {
      _id: 1,
      firstName: 1,
      lastName: 1,
      city: 1,
      profession: 1,
      expertDetails: { aboutMe: 1, inquiryTags: 1 },
    }
  ).exec();
  experts = experts.filter(
    ({ firstName, lastName, expertDetails: { inquiryTags } }) =>
      (!name || firstName.includes(name) || lastName.includes(name)) &&
      (!tag || inquiryTags.includes(tag))
  );
  res.send(experts ?? {});
});

router.get("/inquiries", async (req, res) => {
  const inquiries = await Inquiry.find(req.query).exec();
  res.send(inquiries ?? {});
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  console.log(user);
  res.send(user);
});

module.exports = router;
