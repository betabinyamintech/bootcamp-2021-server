var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const  {idUser,title,explanation,inquirySubjects,status}= req.body
  res.send(idUser,title,explanation,inquirySubjects,status);

});

//creat data
router.post('/', function(req, res, next) {
  const  {idUser,title,explanation,inquirySubjects,status}= req.body
  const Inquiry = await new Inquiry({ title, completed: false }).save();
  console.log("POST! creat inquiry", Inquiry);
  res.send(Inquiry);
});

//updata
router.put('/inquiry/:idInquiry', function(req, res, next) {

  const  {idUser,title,explanation,inquirySubjects,status}= req.body

  await Product.updateOne({ idUser }, { idUser,title,explanation,inquirySubjects,status }).exec();

  res.send("OK!");

});

//delete data
router.delete('/inquiry/:idInquiry', async function(req, res, next) {
  const  {idUser}= req.params
  await Product.deleteOne({ idUser }).exec();

  res.send("OK!");

});

module.exports = router;
