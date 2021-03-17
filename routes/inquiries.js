var express = require('express');
var router = express.Router();
const {models:{Inquiry}} = require('../models')

/* GET users listing. */
router.get('/:inquiryId',async function(req, res, next) {
  const {inquiryId} = req.params;
  const inquiry = await Inquiry.findOne({_id:inquiryId})
  console.log(inquiry);
  res.send(inquiry);

});

//creat data
router.post('/',async function(req, res, next) {
  // const  {idUser,title,explanation,inquirySubjects,status}= req.body
  const inquiry = await new Inquiry(req.body ).save();
  console.log("POST! creat inquiry", inquiry);
  res.send(inquiry);
});

//updata
router.put('/:idInquiry',async function(req, res, next) {
const {idInquiry} = req.params
  const  {idUser,title,explanation,inquirySubjects,status}= req.body
  await Inquiry.updateMany({ _id:idInquiry }, { idUser,title,explanation,inquirySubjects,status }).exec();

  res.send("OK!");

});

//delete data
router.delete('/:idInquiry', async function(req, res, next) {
  const  {idInquiry}= req.params
  await Inquiry.deleteOne({ _id:idInquiry }).exec();

  res.send("OK!");

});
// app.post("/inquiry", authenticateToken, async (req, res) => {
//   const { idUser, title, explanation, inquiryTags, status } = req.body;
//   const inquiry = await new Inquiry({
//     idUser,
//     title,
//     explanation,
//     inquiryTags,
//     status,
//   }).save();
//   res.send(inquiry);
// });

// app.get("/inquiry", authenticateToken, async (req, res) => {
//   const { _id } = req.body;
//   const inquiry = await Inquiry.findOne({ _id }).exec();
//   res.send(inquiry ?? {});
// });
// app.get("/inquiry", authenticateToken, async (req, res) => {
//   const { idUser } = req.body;
//   const inquiries = await Inquiry.find({ idUser }).exec();
//   res.send(inquiries ?? {});
// });
module.exports = router;
