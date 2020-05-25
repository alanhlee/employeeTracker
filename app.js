const { prompt } = require("inquirer");
const { promisify } = require("util");
const { writeFile, appendFile } = require("fs").promises;
const db = require("./db/index.js");

prompt({
  type: "list",
  name: "action",
  message: "What would you like to do?",
  choices: [
    "Add Department",
    "Add Role",
    "Add Employee",
    "View Departments,",
    "View Roles",
    "View Employees",
    "Update Employee Roles",
  ],
}).then((data) => {
  if (data.action === "Add Department") {
    prompt({
      type: "input",
      name: "depName",
      message: "What is the name of the new department?",
    }).then((data) => {
      db.query(
        "INSERT INTO department (name) VALUES (?)",
        [data.depName],
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log(`Successfully added ${data.depName} department`);
          }
        }
      );
      // db.close();
    });
  }
});
