var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

/* GET all experts. */
router.get("/experts", authenticateToken, async (req, res) => {
  const users = await User.find({}).exec();
  const experts = users
    .filter((user) => user.isExpert)
    .map(({ _id, firstName, lastName, helpKind, city, profession, inquiryTags }) => {
      _id, firstName, lastName, helpKind, city, profession, inquiryTags;
    });
  res.send(experts ?? {});
});

router.get("/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  console.log(user);
  res.send(user);
});

router.put("/", authenticateToken, async (req, res) => {
  const { _id } = req.user;
  const updatedUser = await User.updateOne({ _id }, req.body, {
    omitUndefined: true,
  }).exec();

  res.send(updatedUser);
});
module.exports = router;
