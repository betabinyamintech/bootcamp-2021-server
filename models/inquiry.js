const mongoose = require("mongoose");
const User = require("./user");

const inquirySchema = new mongoose.Schema(
  {
    idUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    inquirySubjects: { type: [String], required: true },

    status: {
      type: String,
      enum: ["sent", "matchesFound", "movedToExpert", "response"],
    },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = Inquiry;
