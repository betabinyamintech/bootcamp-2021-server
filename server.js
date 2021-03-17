//server.js
const app = require("./app");

app.listen(process.env.PORT | 80, () => {
  console.log("Opened port succesfully at port " + process.env.PORT);
});
