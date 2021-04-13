var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

/* GET all experts. */

router.get("/me", authenticateToken, async (req, res) => {
  const { password, ...resUser } = req.user.toObject();
  res.send(resUser);
});

router.put("/me", authenticateToken, async (req, res) => {
  const { _id } = req.user;
  const updatedUser = await User.findOneAndUpdate({ _id }, req.body, {
    omitUndefined: true,
    runValidators: true,
    new:true
  }).exec();
  const { password, ...resUser } = updatedUser.toObject();
  res.send(resUser);
});
module.exports = router;
