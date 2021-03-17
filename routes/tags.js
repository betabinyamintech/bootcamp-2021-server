var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();
const {
  models: { Tag },
} = require("../models");
/* GET users listing. */

router.get("/:name",authenticateToken, async (req, res) => {
  const { name } = req.params;
  const tag = await Tag.findOne({ name }).exec();
  res.send(tag);
});
router.get("/",authenticateToken, async (req, res) => {
  const tag = await Tag.find().exec();
  res.send(tag);
});
router.post("/",authenticateToken, async (req, res) => {
  const { name } = req.body;
  const tag = await new Tag({ name }).save();
  console.log("POST!", tag);
  res.send(tag);
});
router.delete("/",authenticateToken, async (req, res) => {
  const { name } = req.body;
  await Tag.deleteOne({ name }).exec();

  res.send("OK!");
});

module.exports = router;
