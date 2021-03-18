var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

/* GET all experts. */

router.get("/me", authenticateToken, async (req, res) => {
  res.send(req.user);
});

router.put("/me", authenticateToken, async (req, res) => {
  const { _id } = req.user;
  // console.log(req.user);
  const updatedUser = await User.updateOne({ _id }, req.body, {
    omitUndefined: true,
  }).exec();

  res.send(updatedUser);
});
module.exports = router;
