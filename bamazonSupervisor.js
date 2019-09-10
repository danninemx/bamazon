// Global variables
const mysql = require("mysql");
const inquirer = require('inquirer');
const Table = require('cli-table');
let started = false;

// DB connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
})

// Call this to end app.
let farewell = function () {
    connection.end();
    console.log(`\n===== CLOSING SUPERVISION PORTAL =====\n\n\n`);
}

// Call this to check department_id overlap.
let counted = function (ci) {
    connection.query('SELECT COUNT(*) AS cnt FROM `departments` WHERE department_id = ?', [ci], function (err, res) {
        if (err) throw err;
        let count = res[0].cnt;
        if (count > 0) { return true } else { return false };
    })
}

// Use cli-table to render.
let render = (data) => {
    // Instantiate horizontal table.
    let table = new Table({
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
            , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
            , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
            , 'right': '║', 'right-mid': '╢', 'middle': '│'
        }
    });

    // Table header
    table.push(['#', 'DEPARTMENT ID', 'DEPARTMENT NAME', 'OVERHEAD COST($)', 'PRODUCT SALES($)', 'TOTAL PROFIT($)']);

    // Loop through data, pretti-fy, push to table and print.
    let count = 0;
    for (ea of data) {
        count++;
        let prettyCost = parseFloat(-1 * ea.dept_cost).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let prettySales = parseFloat(ea.prod_sales).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let prettyProfit = parseFloat(ea.tot_prof).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        table.push([count, ea.dept_id, ea.dept_name, prettyCost, prettySales, prettyProfit]);
    }
    console.log(table.toString());

    // End app.
    farewell();
}

// Call this to query sales and draw a summary table.
let viewSales = function () {
    connection.query('SELECT d.department_id dept_id, d.department_name dept_name, d.over_head_costs dept_cost, SUM(p.product_sales) prod_sales, (SUM(p.product_sales) - d.over_head_costs) tot_prof FROM departments d LEFT JOIN products p ON d.department_name = p.department_name GROUP BY dept_id, dept_name, dept_cost', function (err, res) {
        if (err) throw err;

        console.log(`\n----- ${res.length} departments on listing. -----\n`);
        render(res);
    })
}

// Call this to add a new department.
let createDept = () => {
    console.log(`\n===== Please describe the new department. =====\n`)
    return inquirer
        .prompt([
            {
                type: 'input',
                message: 'Department ID :',
                name: 'id'
            },
            {
                type: 'input',
                message: 'Department Name :',
                name: 'name'
            },
            {
                type: 'input',
                message: 'Overhead Costs :',
                name: 'cost'
            }])
        .then((newDept) => {

            // Clean up input.
            let id;
            if (typeof newDept.id !== 'string') {
                id = newDept.id.toString().trim();
            } else {
                id = newDept.id.trim();
            }

            let cost = parseFloat(parseFloat(newDept.cost).toFixed(2));

            // Validate overhead cost.
            if (typeof cost !== 'number' || cost <= 0) {
                console.log(`\n***** Overhead cost must be entered as a positive number. *****\n`);
                createDept();
            }
            else if (counted(id)) {
                console.log(`\n***** DEPARTMENT ID of ${id} is already in use. Please try another.*****\n`);
                createDept();
            }
            else {
                connection.query('INSERT INTO departments (department_id, department_name, over_head_costs) VALUES (?,?,?)', [id, newDept.name, newDept.cost], function (err, res) {
                    if (err) throw err;
                    console.log(`\n----------------------------\n`);
                    console.log(`${res.affectedRows} department added as below:\n`);
                    console.log(`DEPARTMENT ID: ${id}  ||  DEPARTMENT NAME: ${newDept.name}  ||  OVERHEAD COSTS: ${newDept.cost}`);
                    console.log(`\n----------------------------\n`);
                    farewell();
                })
            }
        })
}


// Call this to start supervisor interaction.
let start = function () {
    return inquirer
        .prompt([
            {
                type: 'list',
                message: 'Please select an action:',
                choices: [
                    'View Product Sales by Department',
                    'Create New Department'],
                name: 'action'
            }])
        .then((supervise) => {

            switch (supervise.action) {
                case 'View Product Sales by Department':
                    viewSales();
                    break;

                case 'Create New Department':
                    createDept();
                    break;

                default:
                    console.log('Easter egg!')
                    return;
            }
        })
}

// Start on load.
if (!started) {
    started = true;
    start();
}