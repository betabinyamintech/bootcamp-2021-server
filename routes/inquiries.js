var express = require("express");
var router = express.Router();
const { authenticateToken } = require("../jwt");
const {
  models: { Inquiry },
} = require("../models");
const updateStatusIfMeetingPassed =async (inquiryId) => {
  return await Inquiry.findOneAndUpdate(
    {
      _id: inquiryId,
      status: "meetingScheduled",
      meetingOptions: { scheduledDate: { $lt: new Date() } },
    },
    { status: "meetingDatePassed" }
  ).exec();
};

/* GET inquiries by user id. */
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const inquiries = await Inquiry.find(
    { userId },
    { _id: 1, inquiryTitle: 1, status: 1, createdAt: 1 }
  ).exec();
inquiries.map((inquiry)=>updateStatusIfMeetingPassed(inquiry._id));
  res.send(inquiries ?? {});
});

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
  const inquiry = await Inquiry.updateOne({ _id: inquiryId }, req.body, {
    omitUndefined: true,
    runValidators: true,
  }).exec();

  res.send(inquiry);
});

//creat new inquiry
router.post("/new", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const inquiry = await new Inquiry({ userId, ...req.body }).save();
  console.log("POST! creat inquiry ", inquiry);
  res.send(inquiry);
});

module.exports = router;
