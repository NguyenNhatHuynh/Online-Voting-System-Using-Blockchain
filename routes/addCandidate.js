// routes/addCandidate.js
var express = require("express");
var router = express.Router();
var conn = require("../database"); // Kết nối cơ sở dữ liệu của bạn

// API để thêm ứng viên vào cơ sở dữ liệu
router.post("/addCandidate", function (req, res) {
  const { name, party, age, qualification, account } = req.body;
  console.log("Received Data: ", req.body); // Log dữ liệu nhận từ frontend

  // Thêm ứng viên vào cơ sở dữ liệu
  const sql =
    "INSERT INTO candidates (name, party, age, qualification) VALUES (?, ?, ?, ?)";
  conn.query(
    sql,
    [name, party, age, qualification, account],
    function (err, result) {
      if (err) {
        console.error("Error inserting candidate into database: ", err);
        res.status(500).send("Error adding candidate to database");
      } else {
        res.status(200).send("Candidate added to database");
      }
    }
  );
});

module.exports = router;
