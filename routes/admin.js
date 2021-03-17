var express = require("express");
const { usersRouter } = require(".");
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

router.get("/users", async (req, res) => {
  const users = await User.find({}).exec();
  console.log("users", users);
  res.send(users);
});

module.exports = router;
