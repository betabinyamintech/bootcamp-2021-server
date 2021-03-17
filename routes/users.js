var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

/* GET all experts. */

router.get("/", authenticateToken, async (req, res) => {
  const { _id } = req.user;
  const user = await User.findOne({ _id }).exec();
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
