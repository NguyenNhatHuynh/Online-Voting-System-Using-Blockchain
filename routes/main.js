var express = require("express");
var router = express.Router();
/* GET users listing. */
// const express=require('express');
// const app=express()
var conn = require("../database");

router.get("/form", function (req, res, next) {
  // res.render('voter-registration.ejs');
  if (req.session.loggedinUser) {
    res.render("voter-registration.ejs");
  } else {
    res.redirect("/login");
  }
});

var getAge = require("get-age");

var nodemailer = require("nodemailer");
var rand = Math.floor(Math.random() * 10000 + 54);
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguyennhathuynh01062003@gmail.com",
    pass: "hztqnqkgtyshyopb",
  },
});

var account_address;
var data;

// app.use(express.static('public'));
// //app.use('/css',express.static(__dirname+'public/css'));
// //app.use(express.json());
// app.use(express.urlencoded());

router.post("/registerdata", function (req, res) {
  var dob = [];
  data = req.body.aadharno; // Lấy số Aadhar
  account_address = req.body.account_address; // Lấy địa chỉ tài khoản Metamask

  let sql = "SELECT * FROM aadhar_info WHERE Aadharno = ?";
  conn.query(sql, data, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      return res.status(500).send("Lỗi khi truy vấn cơ sở dữ liệu");
    }

    // Kiểm tra xem có dữ liệu trả về không
    if (results.length === 0) {
      return res
        .status(404)
        .send("Không tìm thấy dữ liệu Aadhar cho số Aadhar này");
    }

    // Lấy ngày sinh (Dob) từ kết quả truy vấn
    dob = results[0].Dob;
    var email = req.session.emailAddress; // Lấy email từ session
    var age = getAge(dob);
    var is_registered = results[0].Is_registered;

    // Kiểm tra nếu người dùng đã đăng ký hay chưa
    if (is_registered !== "YES") {
      if (age >= 18) {
        var rand = Math.floor(Math.random() * 10000 + 54); // Tạo OTP ngẫu nhiên
        req.session.otp = rand; // Lưu OTP vào session

        // Cấu hình gửi email OTP
        var mailOptions = {
          from: "khamkerd4000@gmail.com", // Địa chỉ gửi
          to: email, // Lấy email người dùng từ session
          subject: "Please confirm your Email account",
          text: "Hello, Your otp is " + rand,
        };

        // Gửi email OTP
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        res.render("emailverify.ejs");
      } else {
        res.send("You cannot vote as your age is less than 18");
      }
    } else {
      res.render("voter-registration.ejs", {
        alertMsg: "You are already registered. You cannot register again",
      });
    }
  });
});

router.post("/otpverify", (req, res) => {
  var otp = req.body.otp;
  if (otp == req.session.otp) {
    // So sánh OTP người dùng nhập và OTP trong session
    var record = { Account_address: account_address, Is_registered: "Yes" };
    var sql = "INSERT INTO registered_users SET ?";
    conn.query(sql, record, function (err2, res2) {
      if (err2) {
        throw err2;
      } else {
        var sql1 = "Update aadhar_info set Is_registered=? Where Aadharno=?";
        var record1 = ["YES", data];
        console.log(data);
        conn.query(sql1, record1, function (err1, res1) {
          if (err1) {
            res.render("voter-registration.ejs");
          } else {
            console.log("1 record updated");
            var msg = "You are successfully registered";
            res.render("voter-registration.ejs", { alertMsg: msg });
          }
        });
      }
    });
  } else {
    res.render("voter-registration.ejs", {
      alertMsg: "Session Expired! , You have entered wrong OTP ",
    });
  }
});

// router.get('/register',function(req,res){
//     res.sendFile(__dirname+'/views/index.html')
// });

/*app.get('/signin_signup',function(req,res){
    res.sendFile(__dirname+'/views/signup.html')
});

app.get('/signup',function(req,res){
    console.log(req.body);
    res.sendFile(__dirname+'/views/signup.html')
});*/

module.exports = router;
