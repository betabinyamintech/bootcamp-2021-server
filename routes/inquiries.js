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

  if (inquiry.status === "meetingScheduled" && today > inquiry.meetingOptions.scheduledDate) {
    await Inquiry.findOneAndUpdate({ _id: inquiry._id }, { status: "meetingDatePassed" }, { new: true }).exec();
    return "meetingDatePassed";
  }
  
  return inquiry.status;
};

/* GET inquiries by user id. */
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  let inquiries = await Inquiry.find({ userId }).exec();
  let expertInquiries = await Inquiry.find({ movedToExpert: { expertId: userId } }).exec();
  inquiries = inquiries.concat(expertInquiries);
  inquiries = await Promise.all(
    inquiries.map(async (inquiry) => ({
      status: updatedStatus(inquiry),
      ...inquiry.toObject(),
    }))
  );
  console.log(inquiries);

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
  const objectInquiry = {
    status: updatedStatus(inquiry),
    ...inquiry.toObject(),
  };

  delete objectInquiry.userId.password;
  for (let i = 0; i < objectInquiry.expertsFound.length; i++) {
    delete objectInquiry.expertsFound[i].password;
  }
  objectInquiry.movedToExpert.expertId && delete objectInquiry.movedToExpert.expertId.password;

  res.send(objectInquiry);
});

//update
router.put("/:inquiryId", authenticateToken, async (req, res) => {
  const isValidateTags = await validateTags(req.body.inquiryTags);
  if (!isValidateTags) {
    res.status(403).send("invalid tag");
    return;
  }
  const { inquiryId } = req.params;
  const oldInquiry = await Inquiry.findOne({ _id: inquiryId }).exec();
  const newStatus = req.body.status;
  console.log(newStatus,oldInquiry.status);
  if (newStatus) {
    switch (oldInquiry.status) {
      case "opened":
        if (
          newStatus === "missingDetails" ||
          newStatus === "irrelevant" ||
          newStatus === "matchesFound"
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
        if (newStatus === "irrelevant" || newStatus === "movedToExpert") {
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
        if (newStatus === "irrelevant" || newStatus === "responseFromExpert") {
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
        if (newStatus === "irrelevant" || newStatus === "meetingScheduled") {
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
        if (newStatus === "irrelevant" || newStatus === "meetingDatePassed") {
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
        res.status(403).send("This status changes automatically");
        return;
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

  let autoUpdatedStatus=updatedStatus(inquiry);
  if(oldInquiry.status==="missingDetails")
  {
    autoUpdatedStatus= "opened";
  }
  const objectInquiry = {
    status: autoUpdatedStatus,
    ...inquiry.toObject(),
  };
  res.send(objectInquiry);
});

//creat new inquiry

router.post("/new", authenticateToken, async (req, res) => {
  const isValidateTags = await validateTags(req.body.inquiryTags);
  if (!isValidateTags) {
    res.status(403).send("invalid tag");
    return;
  }

  const userId = req.user._id;
  let inquiry = await new Inquiry({
    userId,
    status: "opened",
    ...req.body,
  }).save();
  const objectInquiry = {
    status: "updatedStatus(inquiry)",
    ...inquiry.toObject(),
  };
  res.send(objectInquiry);
});

module.exports = router;
