var express = require("express");
var router = express.Router();
var conn = require("../database"); // Kết nối cơ sở dữ liệu của bạn

// API để cập nhật trạng thái cử tri đã đăng ký
router.post("/updateVoterStatus", function (req, res) {
  const { accountAddress } = req.body; // Lấy địa chỉ Ethereum từ body của yêu cầu
  console.log("Received Data: ", req.body); // Log dữ liệu nhận từ frontend

  // Kiểm tra nếu accountAddress không có giá trị
  if (!accountAddress) {
    return res.status(400).send("Account address is required");
  }

  // Cập nhật trường "registered_voters" thành "YES" cho địa chỉ Ethereum
  const sql =
    "UPDATE registered_users SET registered_voters = 'YES' WHERE Account_address = ?";

  conn.query(sql, [accountAddress], function (err, result) {
    if (err) {
      console.error("Error updating voter status in database: ", err);
      res.status(500).send("Error updating voter status");
    } else {
      res.status(200).send("Voter status updated successfully");
    }
  });
});

module.exports = router;
