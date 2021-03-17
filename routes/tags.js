var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();
const {
  models: { Tag },
} = require("../models");

router.get("/", authenticateToken, async (req, res) => {
  const tagsList = await Tag.find({}).exec();
  res.send(tagsList);
});

// router.get("/:name", authenticateToken, async (req, res) => {
//   const { name } = req.params;
//   const tag = await Tag.findOne({ name }).exec();
//   res.send(tag);
// });

router.post("/", authenticateToken, async (req, res) => {
  // const { name } = req.body;
  const tag = await new Tag(req.body).save();
  console.log("POST! ", tag);
  res.send(tag);
});

module.exports = router;
