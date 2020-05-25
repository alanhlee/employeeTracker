const { prompt } = require("inquirer");
const { promisify } = require("util");
const { writeFile, appendFile } = require("fs").promises;

const app = async () => {
  const db = await require("./db/index.js")();
  let { action } = await prompt({
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
  });

  if (action === "Add Department") {
    let { depName } = await prompt({
      type: "input",
      name: "depName",
      message: "What is the name of the new department?",
    });

    try {
      await db.query("INSERT INTO department (name) VALUES (?)", [depName]);
    } catch (e) {
      console.log(e);
    }

    console.log(`Successfully added department ${depName}`);
  } else if (action === "Add Role") {
    let { roleTitle } = await prompt({
      type: "input",
      name: "roleTitle",
      message: "What is the title of the new role?",
    });

    let { salary } = await prompt({
      type: "input",
      name: "salary",
      message: "What is the salary for this role?",
    });
    let [departments, _] = await db.query("SELECT name, id FROM department");
    // console.log(departments);
    let { depRoleName } = await prompt({
      type: "list",
      name: "depRoleName",
      message: "What department does this role belong to?",
      choices: departments.map((department) => department.name),
    });

    let department = departments.find(
      (department) => department.name === depRoleName
    );

    await db.query(
      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
      [roleTitle, salary, department.id]
    );
    
    console.log(
      `Successfully added ${roleTitle} to ${department.name} department`
    );
  }
};

app();
