var express = require("express");
var router = express.Router();
const { authenticateToken } = require("../jwt");
const {
  models: { Inquiry },
} = require("../models");
const updateStatusIfMeetingPassed = async (inquiry) => {
  const today = new Date();

  if (inquiry.status === "meetingScheduled" && today > inquiry.meetingOptions.scheduledDate) {
    console.log("inquiry", inquiry);
    const newInquiry = await Inquiry.findOneAndUpdate(
      { _id: inquiry._id },
      { status: "meetingDatePassed" },
      { new: true }
    ).exec();
    console.log("new inquiry", newInquiry);
    return newInquiry;
  }
  return inquiry;
};

/* GET inquiries by user id. */
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  let inquiries = await Inquiry.find({ userId }).exec();
  inquiries = await Promise.all(
    inquiries.map(async (inquiry) => {
      const { _id, inquiryTitle, status, createdAt } = await updateStatusIfMeetingPassed(inquiry);
      return { _id, inquiryTitle, status, createdAt };
    })
  );
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
