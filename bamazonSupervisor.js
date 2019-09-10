// Global variables
const mysql = require("mysql");
const inquirer = require('inquirer');
// const util = require('util');
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

// Call this process.
let farewell = function () {
    connection.end();
    console.log(`\n===== CLOSING SUPERVISION PORTAL =====\n\n\n`);
}
/*
// Call this to check item_id overlap.
let counted = function (ci) {
    connection.query('SELECT COUNT(*) AS cnt FROM `products` WHERE item_id = ?', [ci], function (err, res) {
        if (err) throw err;
        let count = res[0].cnt;
        if (count > 0) { return true } else { return false };
    })
}
*/

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
    table.push(['#', 'DEPARTMENT ID', 'DEPARTMENT NAME', 'OVERHEAD COST', 'PRODUCT SALES', 'TOTAL PROFIT']);

    // Loop through data, pretti-fy, and push to table.
    let count = 0;
    for (ea of data) {
        count++;
        let prettyCost = parseFloat(-1 * ea.dept_cost).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let prettySales = parseFloat(ea.prod_sales).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let prettyProfit = parseFloat(ea.tot_prof).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        table.push([count, ea.dept_id, ea.dept_name, prettyCost, prettySales, prettyProfit]);
        // count === res.length ? farewell() : 0;
    }

    console.log(table.toString());

    farewell();
}

// Call this to render a summarized table in their terminal/bash window.
let viewSales = function () {

    connection.query('SELECT d.department_id dept_id, d.department_name dept_name, d.over_head_costs dept_cost, SUM(p.product_sales) prod_sales, (SUM(p.product_sales) - d.over_head_costs) tot_prof FROM departments d LEFT JOIN products p ON d.department_name = p.department_name GROUP BY dept_id, dept_name, dept_cost', function (err, res) {
        // connection.query('SELECT department_id, department_name, over_head_costs, product_sales FROM `departments` AS d', function (err, res) {
        if (err) throw err;

        console.log(`\n----- ${res.length} departments on listing. -----\n`);
        // console.log(`#)  department_id  ||  department_name  ||  over_head_costs  ||  product_sales  || total_profit`);
        // console.log(`-----------------------------------------------------------------------------------------------`);

        render(res);
    })
}

/*
// list all items with an inventory count lower than five.
let viewLow = function () {
    connection.query('SELECT item_id, product_name, price, stock_quantity FROM `products` HAVING stock_quantity < 5', function (err, res) {
        if (err) throw err;

        console.log(`\n----- ${res.length} product(s) have less than 5 units in stock. -----\n`);
        let count = 0;
        for (ea of res) {
            count++;
            console.log(`${count})  ITEM ID: ${ea.item_id}  ||  ITEM NAME: ${ea.product_name}  ||  PRICE: $${ea.price}  ||  QUANTITY: ${ea.stock_quantity}`);
            count === res.length ? farewell() : 0;
        }
    })
}


// Call this to add ordered qty to current qty.
let addInventory = async function (ai, cq, aq) {
    let newQty = cq + aq;
    connection.query('UPDATE `products` SET ? WHERE item_id = ?',
        [
            {
                stock_quantity: newQty
            },
            ai
        ],
        function (err, res) {
            if (err) throw err;

            console.log(`\n----------------------------\n`);
            console.log(`${res.affectedRows} product updated!\n`);
            console.log(`ITEM ID ${ai} now has stock count of ${newQty}.\n`);
            console.log(`----------------------------\n`);
            farewell();
        })
}

// display a prompt that will let the manager "add more" of any item currently in the store.
let addQty = function () {
    console.log(`\nAdding to inventory\n`);
    return inquirer
        .prompt([
            {
                type: 'input',
                message: 'ITEM ID :',
                name: 'id'
            },
            {
                type: 'input',
                message: 'Quantity :',
                name: 'quantity'
            }])
        .then((order) => {
            // Validate quanity.
            let id = order.id.toString().trim();
            let qty = parseInt(order.quantity);
            if (typeof qty === 'number' && qty > 0) {
                connection.query('SELECT stock_quantity FROM `products` WHERE item_id = ?', [id], function (err, res) {
                    if (err) throw err;

                    curQty = res[0].stock_quantity;
                    addInventory(id, curQty, qty);
                })
            } else {
                console.log(`\n***** Quantity has to be a positive integer. *****\n`);
                farewell();
            }
        })
}
*/
// Call this to add a new product.
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
            let pr = parseFloat(parseFloat(newDept.cost).toFixed(2));
            let qty = parseInt(newDept.qty);

            // Validate quanity.
            if (typeof qty !== 'number' || qty <= 0) {
                console.log(`\n***** Quantity has to be a positive integer. *****\n`);
                addProd();
            }
            // Validate price.
            else if (typeof pr !== 'number' || pr <= 0) {
                console.log(`\n***** Price has to be a positive number. *****\n`);
                addProd();
            }
            // Validate Product ID.
            // else if (counted(id) !== 0) {
            //     console.log('count, called from main func, is ' + counted(id) + ' and is of type ' + typeof counted(id));
            //     console.log(`\n***** PRODUCT ID of ${id} is already in use. Please try another.*****\n`);
            //     addProd();
            // }
            else if (counted(id)) {
                console.log('count, called from main func, is ' + counted(id) + ' and is of type ' + typeof counted(id));
                console.log(`\n***** PRODUCT ID of ${id} is already in use. Please try another.*****\n`);
                addProd();
            }
            else {
                // console.log('This should be safe to add.');
                connection.query('INSERT INTO products (item_id, product_name, department_name, price, stock_quantity) VALUES (?,?,?,?,?)', [id, newDept.prod, newDept.dept, pr, qty], function (err, res) {
                    if (err) throw err;
                    console.log(`\n----------------------------\n`);
                    console.log(`${res.affectedRows} product updated as below:\n`);
                    console.log(`ITEM ID: ${id}  ||  ITEM NAME: ${newDept.prod}  ||  DEPARTMENT: ${newDept.dept}  ||  PRICE: $${pr}  ||  QUANTITY: ${qty}`);
                    console.log(`\n----------------------------\n`);
                    farewell();
                })
            }
        })
}


// Call this to start manager interaction.
let start = function () {
    // console.log(`\n----- Please select an action -----\n`);
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