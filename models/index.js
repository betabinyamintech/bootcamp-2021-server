const mongoose = require("mongoose");

const User = require("./user");
const Inquiry = require("./inquiry");
const Tag = require("./tag");

const connectDb = async () => {
  const mongoUrl = process.env.MONGO_USER_NAME_PASS;
  console.log("Connecting to mongo server in index: " + mongoUrl);
  return await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
const models = { User, Inquiry, Tag };

module.exports = { connectDb, models };
