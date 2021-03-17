var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

router.use((req, res, next) => {
  if (!req.user.isAdmin) {
    res.sendStatus(403);
    return;
  }
});

router.get("/experts", authenticateToken, async (req, res) => {
  const users = await User.find({}).exec();
  const experts = users
    .filter((user) => user.isExpert)
    .map(
      ({
        _id,
        firstName,
        lastName,
        helpKind,
        city,
        profession,
        inquiryTags,
      }) => {
        _id, firstName, lastName, helpKind, city, profession, inquiryTags;
      }
    );
  res.send(experts ?? {});
});

router.get("/inquiries", authenticateToken, async (req, res) => {
  const { q } = req.query;
  const inquiries = await Inquiry.find({}).exec();
  res.send(inquiries ?? {});
});

router.get("/user/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  console.log(user);
  res.send(user);
});

module.exports = router;
