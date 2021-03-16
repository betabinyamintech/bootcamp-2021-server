var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:inquiryId', function(req, res, next) {
  const  {inquiryId}= req.params;
  res.send(inquiryId);

});

//creat data
router.post('/', function(req, res, next) {
  const  {idUser,title,explanation,inquirySubjects,status}= req.body
  const Inquiry = await new Inquiry({ title, completed: false }).save();
  console.log("POST! creat inquiry", Inquiry);
  res.send(Inquiry);
});

//updata
router.put('/:idInquiry', function(req, res, next) {

  const  {idUser,title,explanation,inquirySubjects,status}= req.body

  await Inquiry.updateOne({ idUser }, { idUser,title,explanation,inquirySubjects,status }).exec();

  res.send("OK!");

});

//delete data
router.delete('/:idInquiry', async function(req, res, next) {
  const  {idUser}= req.params
  await Product.deleteOne({ idUser }).exec();

  res.send("OK!");

});

module.exports = router;
