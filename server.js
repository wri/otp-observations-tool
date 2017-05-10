const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static("dist"));

app.use((req, res) => {
  res.sendFile(__dirname + "/dist/index.html");
})

app.listen(PORT, function () {
  console.log("Angular App Is Running on port " + PORT + "!");
});