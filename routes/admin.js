var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User, Inquiry },
} = require("../models");

router.use(authenticateToken, (req, res, next) => {
  if (!req.user.isAdmin) {
    res.sendStatus(403);
    return;
  }
  next();
});

router.get("/experts", async (req, res) => {
  const { name, tag } = req.query;
  console.log("req experts:", req.user);
  let experts = await User.find(
    { isExpert: true },
    {
      _id: 1,
      firstName: 1,
      lastName: 1,
      city: 1,
      profession: 1,
      expertDetails: { aboutMe: 1, inquiryTags: 1 },
    }
  ).exec();
  experts = experts.filter(
    ({ firstName, lastName, expertDetails: { inquiryTags } }) =>
      (!name || firstName.includes(name) || lastName.includes(name)) && (!tag || inquiryTags.includes(tag))
  );
  res.send(experts ?? {});
});
const updateStatusIfMeetingPassed = async (inquiry) => {
  const today = new Date();

  if (inquiry.status === "meetingScheduled" && today > inquiry.meetingOptions.scheduledDate) {
    const newInquiry = await Inquiry.findOneAndUpdate(
      { _id: inquiry._id },
      { status: "meetingDatePassed" },
      { new: true }
    ).exec();
    return newInquiry;
  }
  return inquiry;
};
router.get("/inquiries", async (req, res) => {
  let inquiries = await Inquiry.find(req.query).populate("userId").exec();
  inquiries = await Promise.all(
    inquiries.map(async (inquiry) => {
      const {
        inquiryTitle,
        status,
        userId: { firstName, lastName },
        meetingOptions: { scheduledDate, meetingAddress, lengthMeeting },
        createdAt,
        updatedAt,
      } = await updateStatusIfMeetingPassed(inquiry);
      return {
        inquiryTitle,
        status,
        userId: { firstName, lastName },
        meetingOptions: { scheduledDate, meetingAddress, lengthMeeting },
        createdAt,
        updatedAt,
      };
    })
  );

  res.send(inquiries ?? {});
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  res.send(user);
});

module.exports = router;
