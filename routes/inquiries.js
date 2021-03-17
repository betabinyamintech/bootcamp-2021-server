var express = require("express");
const { authenticateToken } = require("../jwt");

var router = express.Router();
const {
  models: { Inquiry },
} = require("../models");

/* GET specific inquiry. */
router.get("/:inquiryId", authenticateToken, async (req, res) => {
  const { inquiryId } = req.params;
  const inquiry = await Inquiry.findOne({ _id: inquiryId });
  console.log(inquiry);
  res.send(inquiry);
});

/* GET inquiries by user id. */
router.get("/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const inquiries = await Inquiry.find({ userId }).exec();
  const clientInquiries = inquiries.map(({ inquiryTitle, status, createdAT })=>{return {inquiryTitle, status, createdAT};}) 
  res.send(clientInquiries ?? {});
});
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const inquiries = await Inquiry.find({ userId }).exec();
  const clientInquiries = inquiries.map(({ inquiryTitle, status, createdAT }) =>({ inquiryTitle, status, createdAT }) );
  res.send(clientInquiries ?? {});
});

/* GET all inquiries. */
router.get("/", authenticateToken, async (req, res) => {
  const inquiries = await Inquiry.find({}).exec();
  res.send(inquiries ?? {});
});

//creat data
router.post("/", authenticateToken, async (req, res) => {
  const inquiry = await new Inquiry(req.body).save();
  console.log("POST! creat inquiry ", inquiry);
  res.send(inquiry);
});

//update
router.put("/:inquiryId", authenticateToken, async (req, res) => {
  const { inquiryId } = req.params;
  // const { userId, title, explanation, inquirySubjects, status } = req.body;
  await Inquiry.updateOne({ _id: inquiryId }, req.body, { omitUndefined: true }).exec();

  res.send("inquiry updated");
});

module.exports = router;
