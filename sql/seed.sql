SELECT employee.id
		, employee.first_name
		, employee.last_name
		, role.title
		, department.name as department
        , role.salary
        , concat(employeeB.first_name, ' ',  employeeB.last_name) as manager 
FROM employee 
INNER JOIN role ON employee.role_id = role.id 
INNER JOIN department ON role.department_id = department.id 
LEFT JOIN employee as employeeB on employeeB.id = employee.manager_id;