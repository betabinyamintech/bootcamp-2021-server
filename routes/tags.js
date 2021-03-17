var express = require("express");
var router = express.Router();
const {
  models: { Tag },
} = require("../models");
/* GET users listing. */

router.get("/:name", async (req, res) => {
  const { name } = req.params;
  const tag = await Tag.findOne({ name }).exec();
  res.send(tag);
});
router.get("/", async (req, res) => {
  const tag = await Tag.find().exec();
  res.send(tag);
});
router.post("/", async (req, res) => {
  const { name } = req.body;
  const tag = await new Tag({ name }).save();
  console.log("POST!", tag);
  res.send(tag);
});
router.delete("/", async (req, res) => {
  const { name } = req.body;
  await Tag.deleteOne({ name }).exec();

  res.send("OK!");
});

module.exports = router;
