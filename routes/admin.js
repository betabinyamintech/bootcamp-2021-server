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
  const { name, tag } = req.query;
  
  const experts = await User.find(
    { isExpert: true },
    {
      _id: 1,
      firstName: 1,
      lastName: 1,
      helpKind: 1,
      city: 1,
      profession: 1,
      inquiryTags: 1,
    }
  )
    .exec()
    .filter(
      ({ firstName, lastName, inquiryTags }) =>
        (!name||firstName.includes(name) || lastName.includes(name)) &&
        (!tag||inquiryTags.includes(tag))
    );
  res.send(experts ?? {});
});

router.get("/inquiries", authenticateToken, async (req, res) => {
  const inquiries = await Inquiry.find(req.query).exec();
  res.send(inquiries ?? {});
});

router.get("/user/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  console.log(user);
  res.send(user);
});

module.exports = router;
