var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();
const {
  models: { Tag },
} = require("../models");

router.get("/", authenticateToken, async (req, res) => {
  let tagsList = await Tag.find({}).exec();
  tagsList = tagsList.map(({ name }) => name);
  res.send(tagsList);
});

router.post("/", authenticateToken, async (req, res) => {
  // const { name } = req.body;
  console.log(req.body);
  const tag = await new Tag(req.body).save();
  console.log("POST! ", tag);
  res.send(tag);
});

module.exports = router;
