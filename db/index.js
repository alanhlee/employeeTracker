const mysql = require("mysql2/promise");

let db = async () => {
  return await mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootroot",
    database: "employee_db",
  });
};
module.exports = db;
