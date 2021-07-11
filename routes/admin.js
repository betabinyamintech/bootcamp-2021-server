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
      (!name || firstName.includes(name) || lastName.includes(name)) &&
      (!tag || inquiryTags.includes(tag))
  );
  res.send(experts ?? {});
});
const updateStatusIfMeetingPassed = async (inquiry) => {
  const today = new Date();

  if (
    inquiry.status === "meetingScheduled" &&
    today > inquiry.meetingOptions.scheduledDate
  ) {
    const newInquiry = await Inquiry.findOneAndUpdate(
      { _id: inquiry._id },
      { status: "meetingDatePassed" },
      { new: true }
    )
      .populate("userId")
      .exec();
    return newInquiry;
  }
  return inquiry;
};
router.get("/inquiries", async (req, res) => {
  let inquiries = await Inquiry.find(req.query)
    .populate("userId")
    .populate("movedToExpert.expertId")
    .exec();
  inquiries = await Promise.all(
    inquiries.map(async (inquiry) => {
      const {
        inquiryTitle,
        inquiryContent,
        status,
        inquiryTags,
        userId: { firstName, lastName, city },
        meetingOptions: { scheduledDate, meetingAddress, lengthMeeting },
        createdAt,
        updatedAt,
        _id,
        movedToExpert: { expertId },
      } = await updateStatusIfMeetingPassed(inquiry);
      return {
        inquiryTitle,
        inquiryTags,
        inquiryContent,
        status,
        userId: { firstName, lastName, city },
        meetingOptions: { scheduledDate, meetingAddress, lengthMeeting },
        createdAt,
        updatedAt,
        _id,
        movedToExpert: { expertId },
      };
    })
  );
  res.send(inquiries ?? {});
});
// router.get("/inquiries/all", authenticateToken, async (req, res) => {
//   console.log("start get all inquiries");
//   let response = await Inquiry.find({}).populate("userId").exec();
//   // let allInquiries = await response.json();
//   res.send(response);
// });

router.get("/users", async (req, res) => {
  // const isExpert = true;
  let searchOptions = {
    "expertDetails.expertProfileCompleted": true,
    isExpert: true,
  };
  const experts = await User.find(searchOptions).exec();

  console.log("experts", experts);
  res.send(experts);
});
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  const resUser = user.toObject();
  delete resUser.password;
  res.send(resUser);
});
module.exports = router;
