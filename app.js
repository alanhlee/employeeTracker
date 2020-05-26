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
      "View Departments",
      "View Roles",
      "View Employees",
      "View Employees by Manager",
      "Remove Employee",
      "Update Employee Role",
      "Update Employee Manager",
    ],
  });

  if (action === "Add Department") {
    // if you want to do something with result from promise always await
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
    // destructuring the array handed to to us by db.query giving second value an _ because we only care about the first thing given to us
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
  } else if (action === "Add Employee") {
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
  } else if (action === "View Employees") {
    let [employees, ___] = await db.query(`
    SELECT employee.id
		, employee.first_name
		, employee.last_name
		, role.title
		, department.name as department
        , role.salary
        , concat(employeeB.first_name, ' '
        , employeeB.last_name) as manager 
FROM employee 
INNER JOIN role ON employee.role_id = role.id 
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee as employeeB on employeeB.id = employee.manager_id;
    `);
    console.table(employees);
  } else if (action === "View Departments") {
    let [departments, _] = await db.query(`SELECT * FROM department;`);
    console.table(departments);
  } else if (action === "View Roles") {
    let [roles, _] = await db.query(`SELECT * FROM role;`);
    console.table(roles);
  } else if (action === "Remove Employee") {
    let [employees, _] = await db.query("SELECT * FROM employee");
    let { rmEmployee } = await prompt({
      type: "list",
      name: "rmEmployee",
      message: "Which employee would you like to remove?",
      choices: employees.map(
        (employee) => employee.first_name + " " + employee.last_name
      ),
    });
    let employee = employees.find(
      (employee) => {
        return rmEmployee ===
        (employee.first_name + " " + employee.last_name)
      });
    await db.query("DELETE from employee WHERE id = ?", [employee.id]);
    console.log(
      `Successfully removed employee ${
        employee.first_name + " " + employee.last_name
      }`
    );
  } else if (action === "Update Employee Role") {
    let [employees, _] = await db.query("SELECT * FROM employee");
    let { employeeToUpdate } = await prompt({
      type: "list",
      name: "employeeToUpdate",
      message: "Which employee would you like to update the role for?",
      choices: employees.map(
        (employee) => employee.first_name + " " + employee.last_name
      ),
    });
    let employee = employees.find((employee) => {
      return employeeToUpdate === employee.first_name + " " + employee.last_name;
    });
    let [roles, __] = await db.query("SELECT * FROM role");
    let { newRole } = await prompt({
      type: 'list',
      name: 'newRole',
      message: 'What is the new role for the employee?',
      choices: roles.map(role => role.title)
    })
    let role = roles.find((role) => role.title === newRole)
    await db.query("UPDATE employee SET role_id = ? WHERE id = ?", [role.id, employee.id]);
    console.log(
      `Successfully updated employee role for ${
        employee.first_name + " " + employee.last_name
      } to ${newRole}` 
    );
  } else if (action === "Update Employee Manager") {
    let [employees, _] = await db.query("SELECT * FROM employee");
    let { employeeToUpdate } = await prompt({
      type: "list",
      name: "employeeToUpdate",
      message: "Which employee would you like to update the role for?",
      choices: employees.map(
        (employee) => employee.first_name + " " + employee.last_name
      ),
    });
    let employee = employees.find((employee) => {
      return (
        employeeToUpdate === employee.first_name + " " + employee.last_name
      );
    });
    let [managers, __] = await db.query("SELECT * FROM employee");
    let { newManager } = await prompt({
      type: "list",
      name: "newManager",
      message: "Who is the new manager for the employee?",
      choices: managers.map(
        (manager) => manager.first_name + " " + manager.last_name
      ),
    });
    let manager = managers.find(
      (manager) => newManager === manager.first_name + " " + manager.last_name
    );
    await db.query("UPDATE employee SET manager_id = ? WHERE id = ?", [
      manager.id,
      employee.id,
    ]);
    console.log(
      `Successfully updated employee manager for ${
        employee.first_name + " " + employee.last_name
      } to ${newManager}`
    );
  } else if (action === 'View Employees by Manager') {
    let [managers, __] = await db.query("SELECT * FROM employee");
    let { managerName } = await prompt({
      type: "list",
      name: "managerName",
      message: "Which manager's employees do you want to view?",
      choices: managers.map(
        (manager) => manager.first_name + " " + manager.last_name
      ),
    });
    let manager = managers.find(
      (manager) => managerName === manager.first_name + " " + manager.last_name
    );
    let [employees, ___] = await db.query(`
    SELECT employee.id
		, employee.first_name
		, employee.last_name
		, role.title
		, department.name as department
        , role.salary
        , concat(employeeB.first_name, ' '
        , employeeB.last_name) as manager 
FROM employee 
INNER JOIN role ON employee.role_id = role.id 
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee as employeeB on employeeB.id = employee.manager_id WHERE employee.manager_id = ?;
    `, [manager.id]);
    console.table(employees);
  }

  app()
};

// how to catch ALL errors within the function with TRY CATCH using ASYNC/AWAIT
try {
  app();
} catch (e) {
  console.log(e);
}
