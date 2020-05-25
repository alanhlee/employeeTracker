DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE role (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  title VARCHAR(50) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT
);

CREATE TABLE employee (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  role_id INT,
  manager_id INT
);