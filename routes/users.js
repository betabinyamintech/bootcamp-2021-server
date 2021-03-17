var express = require("express");
var router = express.Router();

const {
  models: { User },
} = require("../models");

/* GET users listing. */
router.get("/", authenticateToken, async (req, res) => {
  const users = await User.find({}).exec();
  const experts = users.filter((user) => user.isExpert);
  res.send(experts ?? {});
});

module.exports = router;
