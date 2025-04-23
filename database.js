var mysql = require("mysql2"); // Change to mysql2
var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "162000.Huynh",
  database: "voting",
});
conn.connect(function (err) {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    throw err; // Keep throwing the error for debugging
  }
  console.log("Database is connected successfully !");
});
module.exports = conn;