const mongoose = require("mongoose");
// const User = require("./user");

const inquirySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inquiryTitle: {
      type: String,
      required: true,
    },
    inquiryContent: {
      type: String,
      required: true,
    },
    inquiryTags: { type: [String], required: true },

    status: {
      type: String,
      enum: [
        "opened",
        "missingDetails",
        "matchesFound",
        "movedToExpert",
        "responseFromExpert",
        "meetingScheduled",
        "meetingDatePassed",
        "irrelevant",
      ],
      required: true,
    },
    irrelevantDetails: {
      cause: { type: String, enum: ["admin", "user", "expert"] },
      reason: String,
    },
    missingDetails: String,
    expertsFound: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    movedToExpert: {
      expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      answersToExpertQuestions: [{ question: String, ans: String }],
    },
    meetingOptions: {
      optionalDates: [Date],
      lengthMeeting: Number,
      meetingType: {
        type: String,
        enum: ["physically", "phoneCall", "virtual"],
      },
      meetingAddress: String,
      scheduledDate: Date,
    },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = Inquiry;
