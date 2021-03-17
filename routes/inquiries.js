var express = require("express");
var router = express.Router();
const { authenticateToken } = require("../jwt");
const {
  models: { Inquiry },
} = require("../models");

/* GET specific inquiry. */
router.get("/:inquiryId", authenticateToken, async (req, res) => {
  const { inquiryId } = req.params;

  const inquiry = await Inquiry.findOne({ _id: inquiryId })
    .populate("userId")
    .populate("expertsFound")
    .populate("movedToExpert.expertId")
    .exec();
  console.log(inquiry);
  res.send(inquiry);
});

//update
router.put("/:inquiryId", authenticateToken, async (req, res) => {
  const { inquiryId } = req.params;
  // const { userId, title, explanation, inquirySubjects, status } = req.body;
  const inquiry=await Inquiry.updateOne({ _id: inquiryId }, req.body, {
    omitUndefined: true,
  }).exec();

  res.send(inquiry);
});
/* GET inquiries by user id. */
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const inquiries = await Inquiry.find({ userId },{_id,inquiryTitle:1, status:1, createdAT:1}).exec();

  res.send(inquiries ?? {});
});

/* GET all inquiries. */

//creat data
router.post("/new", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const inquiry = await new Inquiry({ userId, ...req.body }).save();
  console.log("POST! creat inquiry ", inquiry);
  res.send(inquiry);
});


module.exports = router;
