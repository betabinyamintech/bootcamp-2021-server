var express = require("express");
const { authenticateToken } = require("../jwt");
var router = express.Router();

const {
  models: { User },
} = require("../models");

/* GET users listing. */
router.get("/experts", authenticateToken, async (req, res) => {
  const users = await User.find({}).exec();
  const experts = users.filter((user) => user.isExpert);
  res.send(experts ?? {});
});
router.put("/",authenticateToken,async(req,res)=>{
  const {_id}=req.user;
  const updatedUser=await User.updateOne({ _id }, req.body, {
    omitUndefined: true,
  }).exec();

  res.send(updatedUser);
})
module.exports = router;
