var express = require("express");
var router = express.Router();
const { authenticateToken } = require("../jwt");
const {
  models: { Inquiry, Tag },
} = require("../models");
const validateTags = async (myTags) => {
  if (!myTags) return true;
  let tagsList = await Tag.find({}).exec();
  tagsList = tagsList.map(({ name }) => name);
  for (let i = 0; i < myTags.length; i++) {
    if (tagsList.indexOf(myTags[i]) === -1) {
      return false;
    }
  }
  return true;
};
const checkChangeStatusField = (inquiry) => {
  const status = inquiry.status;
  switch (status) {
    case "opened":
      return true;
    case "refusedByExpert":
      return true;
    case "missingDetails":
      return inquiry.missingDetails ? true : false;
    case "matchesFound":
      return inquiry.expertsFound.length != 0 ? true : false;
    case "movedToExpert":
      return inquiry.movedToExpert.expertId ? true : false;
    case "responseFromExpert":
      return inquiry.meetingOptions ? true : false;
    case "meetingScheduled":
      return inquiry.meetingOptions.scheduledDate ? true : false;
    case "canceledByExpert":
      return inquiry.cancelReason ? true : false;
    case "canceledByUser":
      return inquiry.cancelReason ? true : false;
    case "meetingDatePassed":
      return true;
    case "irrelevant":
      return inquiry.irrelevantDetails ? true : false;
    default:
      return false;
  }
};

const updatedStatus = async (inquiry) => {
  const today = new Date();
  if (
    inquiry.status === "meetingScheduled" &&
    today > inquiry.meetingOptions.scheduledDate
  ) {
    await Inquiry.updateOne(
      { _id: inquiry._id },
      { status: "meetingDatePassed" }
    ).exec();
    return "meetingDatePassed";
  }
  return inquiry.status;
};
/* GET inquiries by user id. */
router.get("/user", authenticateToken, async (req, res) => {
  console.log("start get");
  const userId = req.user._id;
  let inquiries = await Inquiry.find({ userId })
    .populate("expertsFound")
    .populate("movedToExpert.expertId")
    .exec();

  let searchOptions = {
    "movedToExpert.expertId": userId,
  };
  let expertInquiries = await Inquiry.find(searchOptions)
    // .populate("movedToExpert.expertId")
    .populate("userId")
    .exec();
  inquiries = inquiries.concat(expertInquiries);
  inquiries = await Promise.all(
    inquiries.map(async (inquiry) => ({
      status: updatedStatus(inquiry),
      ...inquiry.toObject(),
    }))
  );
  console.log("inquiries", inquiries);

  res.send(inquiries ?? {});
});
// DELETE specific Inquiry
router.delete("/:inquiryId", authenticateToken, async (req, res) => {
  const { inquiryId } = req.params;
  console.log(inquiryId);
  const inquiry = await Inquiry.deleteOne({ _id: inquiryId });
  console.log("inquiry deleted");
  res.send(inquiryId + " " + " inquiry deleted");
});

/* GET specific inquiry. */
router.get("/:inquiryId", authenticateToken, async (req, res) => {
  const { inquiryId } = req.params;
  const inquiry = await Inquiry.findOne({ _id: inquiryId })
    .populate("userId")
    // .populate("expertsFound")
    .populate("movedToExpert.expertId")
    .exec();

  const objectInquiry = {
    status: await updatedStatus(inquiry),
    ...inquiry.toObject(),
  };

  delete objectInquiry.userId.password;
  delete objectInquiry.movedToExpert.expertId.expertDetails;
  delete objectInquiry.movedToExpert.answersToExpertQuestions;
  for (let i = 0; i < objectInquiry.expertsFound.length; i++) {
    delete objectInquiry.expertsFound[i].password;
  }
  objectInquiry.movedToExpert.expertId &&
    delete objectInquiry.movedToExpert.expertId.password;

  res.send(objectInquiry);
});

//UPDATE INQUIRY DETAILS
router.put("/:inquiryId", authenticateToken, async (req, res) => {
  console.log("start put");
  console.log("req.body", req.body);
  const isValidateTags = await validateTags(req.body.inquiryTags);
  if (!isValidateTags) {
    res.status(403).send("invalid tag");
    return;
  }
  const { inquiryId } = req.params;
  console.log("inquiryId", inquiryId);
  const oldInquiry = await Inquiry.findOne({ _id: inquiryId }).exec();
  const newStatus = req.body.status;
  if (newStatus) {
    switch (oldInquiry.status) {
      case "opened":
        if (
          newStatus === "missingDetails" ||
          newStatus === "irrelevant" ||
          newStatus === "matchesFound" ||
          newStatus === "canceledByExpert" ||
          newStatus === "refusedByExpert" ||
          newStatus === "canceledByUser"
        ) {
          const isValidStatus = checkChangeStatusField(req.body);
          if (!isValidStatus) {
            res.status(403).send("Please fill all the relevant fields");
            return;
          }
        } else {
          res.status(403).send("invalid status");
          return;
        }
        break;
      case "matchesFound":
        if (
          newStatus === "irrelevant" ||
          newStatus === "movedToExpert" ||
          newStatus === "canceledByExpert" ||
          newStatus === "refusedByExpert" ||
          newStatus === "missingDetails" ||
          newStatus === "canceledByUser"
        ) {
          const isValidStatus = checkChangeStatusField(req.body);
          if (!isValidStatus) {
            res.status(403).send("Please fill all the relevant fields");
            return;
          }
        } else {
          res.status(403).send("invalid status");
          return;
        }
        break;
      case "movedToExpert":
        if (
          newStatus === "irrelevant" ||
          newStatus === "responseFromExpert" ||
          newStatus === "matchesFound" ||
          newStatus === "canceledByExpert" ||
          newStatus === "missingDetails" ||
          newStatus === "canceledByUser" ||
          newStatus === "refusedByExpert"
        ) {
          const isValidStatus = checkChangeStatusField(req.body);
          if (!isValidStatus) {
            res.status(403).send("Please fill all the relevant fields");
            return;
          }
        } else {
          res.status(403).send("invalid status");
          return;
        }
        break;
      case "responseFromExpert":
        if (
          newStatus === "irrelevant" ||
          newStatus === "meetingScheduled" ||
          newStatus === "canceledByExpert" ||
          newStatus === "refusedByExpert" ||
          newStatus === "missingDetails" ||
          newStatus === "canceledByUser"
        ) {
          const isValidStatus = checkChangeStatusField(req.body);
          if (!isValidStatus) {
            res.status(403).send("Please fill all the relevant fields");
            return;
          }
        } else {
          res.status(403).send("invalid status");
          return;
        }
        break;
      case "meetingScheduled":
        if (
          newStatus === "irrelevant" ||
          newStatus === "meetingDatePassed" ||
          newStatus === "refusedByExpert" ||
          newStatus === "canceledByExpert" ||
          newStatus === "missingDetails" ||
          newStatus === "canceledByUser"
        ) {
          const isValidStatus = checkChangeStatusField(req.body);
          if (!isValidStatus) {
            res.status(403).send("Please fill all the relevant fields");
            return;
          }
        } else {
          res.status(403).send("invalid status");
          return;
        }
        break;
      case "meetingDatePassed":
        res.status(403).send("This inquiry cannot be changed anymore");
        return;
      case "missingDetails":
        if (newStatus === "opened") {
          const isValidStatus = checkChangeStatusField(req.body);
          if (!isValidStatus) {
            res.status(403).send("This status changes automatically");
            return;
          }
        }
      case "irrelevant":
        res.status(403).send("This inquiry cannot be changed anymore");
        return;
      default:
    }
  }
  let inquiry = await Inquiry.findOneAndUpdate({ _id: inquiryId }, req.body, {
    omitUndefined: true,
    runValidators: true,
    new: true,
  }).exec();

  let autoUpdatedStatus = updatedStatus(inquiry);
  if (oldInquiry.status === "missingDetails") {
    autoUpdatedStatus = "opened";
  }
  const objectInquiry = {
    status: autoUpdatedStatus,
    ...inquiry.toObject(),
  };
  console.log("objectInquiry", objectInquiry);
  res.send(objectInquiry);
});

//create new inquiry

router.post("/new", authenticateToken, async (req, res) => {
  const isValidateTags = await validateTags(req.body.inquiryTags);
  if (!isValidateTags) {
    res.status(403).send("invalid tag");
    return;
  }
  if (req.body.status && req.body.status != "opened") {
    res.status(403).send("The status must be opened");
    return;
  }
  const userId = req.user._id;
  console.log("request" + req.body);
  let inquiry = await new Inquiry({
    userId,
    ...req.body,
    status: "opened",
  }).save();
  const objectInquiry = {
    status: "updatedStatus(inquiry)",
    ...inquiry.toObject(),
  };
  res.send(objectInquiry);
});

module.exports = router;
