const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    profession: String,
    phone: Number,
    city: String,
    isExpert: Boolean,
    isAdmin: Boolean,

    expertDetails: {
      isVerified: Boolean,
      helpKind: String,
      inquiryTags: [String],
      questionsBeforeMeeting: [String],
      lengthMeeting: Number,
      preferredMeetingType: { type: String, enum: ["physically", "virtual"] },
      meetingAddress: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;