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
    profileFullFields: Boolean,
    imageSrc: String,
    firstName: String,
    lastName: String,
    profession: String,
    phone: String,
    city: String,
    isExpert: Boolean,
    isAdmin: Boolean,

    expertDetails: {
      isVerified: Boolean,
      aboutMe: String,
      helpDescription: String,
      inquiryTags: [String],
      questionsBeforeMeeting: [String],
      lengthMeeting: Number,
      preferredMeetingType: {
        type: String,
        enum: ["physically", "phoneCall", "virtual"],
      },
      meetingAddress: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
