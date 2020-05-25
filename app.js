const { prompt } = require("inquirer");
const { promisify } = require("util");
const { writeFile, appendFile } = require("fs").promises;
const cTable = require("console.table");

const app = async () => {
  const db = await require("./db/index.js")();
  // cTable.table([await db.query('SELECT * FROM ')])
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
    // if you want to do something with result from promise always await (90% time)
    let { depName } = await prompt({
      type: "input",
      name: "depName",
      message: "What is the name of the new department?",
    });

    // anything that requests or responds to database will take time. (asynchronus)
    await db.query("INSERT INTO department (name) VALUES (?)", [depName]);

    console.log(`Successfully added department ${depName}`);
  } else if (action === "Add Role") {
    // assigning a variable DIRECTLY is only possible with await
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
    // assigning variable to array returned from db.query
    let [departments, _] = await db.query("SELECT name, id FROM department");

    let { depRoleName } = await prompt({
      type: "list",
      name: "depRoleName",
      message: "What department does this role belong to?",
      choices: departments.map((department) => department.name),
    });
    // finding choice user made by name allowing us to use the id
    let department = departments.find(
      (department) => department.name === depRoleName
    );
    // now inserting into database rows for role
    await db.query(
      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
      [roleTitle, salary, department.id]
    );

    console.log(
      `Successfully added ${roleTitle} to ${department.name} department`
    );
  } else if (action == "Add Employee") {
    let { first_name } = await prompt({
      type: "input",
      name: "first_name",
      message: "What is the first name of this employee?",
    });
    let { last_name } = await prompt({
      type: "input",
      name: "last_name",
      message: "What is the last name of this employee?",
    });
    let [roles, _] = await db.query("SELECT title, id FROM role");
    let { roleName } = await prompt({
      type: "list",
      name: "roleName",
      message: "What is this employee's role?",
      choices: roles.map((role) => role.title),
    });

    let role = roles.find((role) => role.title === roleName);

    let [employees, __] = await db.query("SELECT id, first_name FROM employee");
    let { employeeName } = await prompt({
      type: "list",
      name: "employeeName",
      message: "Who is the manager of this employee?",
      choices: [...employees.map((employee) => employee.first_name), "None"],
    });
    if (employeeName === "None") {
      await db.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
        [first_name, last_name, role.id, null]
      );
    } else {
      let manager = employees.find(
        (employee) => employee.first_name === employeeName
      );
      await db.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
        [first_name, last_name, role.id, manager.id]
      );
    }
  }
};

// how to catch ALL errors within the function with TRY CATCH using ASYNC/AWAIT
try {
  app();
} catch (e) {
  console.log(e);
}
