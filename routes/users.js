var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();
const {
  models: { User, Tag },
} = require("../models");
/* GET all experts. */
router.get("/me", authenticateToken, async (req, res) => {
  // const { password, ...resUser } = req.user.toObject();
  resUser = req.user.toObject();
  delete resUser.password;
  res.send(resUser);
});
//GET SPECIFIC USER
router.get("/:userId", async (req, res) => {
  console.log("get specific user");
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  const resUser = user.toObject();
  delete resUser.password;
  res.send(resUser);
});
//GET SPECIFIC EXPERT
router.get("/expert/:userId", async (req, res) => {
  console.log("get specific user");
  const { userId } = req.params;
  const user = await User.findOne({ _id: userId });
  const resUser = user.toObject();
  delete resUser.password;
  delete resUser.email;
  delete resUser.phone;
  delete resUser.profileFullFields;
  delete resUser.createdAt;
  delete resUser.updatedAt;
  delete resUser.expertDetails.helpDescription;
  delete resUser.profileFullFields;
  // delete resUser.password;
  res.send(resUser);
});

router.put("/me", authenticateToken, async (req, res) => {
  if (req.body.expertDetails) {
    const myTags = req.body.expertDetails.inquiryTags;
    let tagsList = await Tag.find({}).exec();
    tagsList = tagsList.map(({ name }) => name);
    for (let i = 0; i < myTags.length; i++) {
      if (tagsList.indexOf(myTags[i]) === -1) {
        res.status(403).send(myTags[i] + " is invalid tag");
        return;
      }
    }
  }
  const { _id } = req.user;
  console.log("req.bodyyyy", req.body);
  let update = req.body.userDetails;
  const updatedUser = await User.findOneAndUpdate({ _id }, update, {
    omitUndefined: true,
    runValidators: true,
    new: true,
  }).exec();
  let { password, ...resUser } = updatedUser.toObject();
  console.log("resUser", resUser);
  // const { password, ...resUser } = updatedUser.toObject();
  // resUser = updatedUser.toObject();
  delete resUser.password;
  console.log("res user by users.js", resUser);
  res.send(resUser);
});

module.exports = router;
