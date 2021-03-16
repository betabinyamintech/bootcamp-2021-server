var express = require("express");
var router = express.Router();

/* GET users listing. */

router.get("/", async (req, res) => {
  const { name } = req.body;
  const subject = await Subject.findOne({}).exec();
  res.send(subject);
});
router.post("/", async (req, res) => {
  const { name } = req.body;
  const subject = await new Subject({ name }).save();
  console.log("POST!", subject);
  res.send(subject);
});
router.delete("/", async (req, res) => {
  const { name } = req.body;
  await subjec.deleteOne({ name }).exec();

  res.send("OK!");
});

module.exports = router;
