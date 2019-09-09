// Global variables
const mysql = require("mysql");
const inquirer = require('inquirer');
const util = require('util');
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
    console.log(`\n----- CLOSING MANAGEMENT PORTAL -----\n\n\n`);
}

// Call this to check item_id overlap.
let counted = function (ci) {
    connection.query('SELECT COUNT(*) AS cnt FROM `products` WHERE item_id = ?', [ci], function (err, res) {
        if (err) throw err;
        // console.log('This is from counted: ' + res[0].cnt);
        // return (res[0].cnt !== 0 ? true : false);
        // console.log('printing res:', res);
        // console.log('printing res[0]:', res[0]);
        // console.log('printing res[0].cnt:', res[0].cnt);
        // return res[0].cnt;
        let count = res[0].cnt;
        // console.log('count, called from COUNTED, is ' + count + ' and is of type ' + typeof count);
        // return count;
        if (count > 0) { return true } else { return false };
    })
}

// Call this to list every available item: the item IDs, names, prices, and quantities.
let viewProds = function () {
    connection.query('SELECT item_id, product_name, price, stock_quantity FROM `products`', function (err, res) {
        if (err) throw err;

        console.log(`\n----- ${res.length} products are on listing. -----\n`);
        let count = 0;
        for (ea of res) {
            count++;
            console.log(`${count})  ITEM ID: ${ea.item_id}  ||  ITEM NAME: ${ea.product_name}  ||  PRICE: $${ea.price}  ||  QUANTITY: ${ea.stock_quantity}`);
            count === res.length ? farewell() : 0;
        }
    })
}


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

// Call this to add a new product.
let addProd = function () {
    return inquirer
        .prompt([
            {
                type: 'input',
                message: 'ITEM ID :',
                name: 'id'
            },
            {
                type: 'input',
                message: 'PRODUCT NAME :',
                name: 'prod'
            },
            {
                type: 'input',
                message: 'DEPARTMENT :',
                name: 'dept'
            },
            {
                type: 'input',
                message: 'PRICE :',
                name: 'pr'
            },
            {
                type: 'input',
                message: 'QUANTITY :',
                name: 'qty'
            }])
        .then((newProd) => {
            // Clean up input.
            let id;
            if (typeof newProd.id !== 'string') {
                id = newProd.id.toString().trim();
            } else {
                id = newProd.id.trim();
            }
            let pr = parseFloat(parseFloat(newProd.pr).toFixed(2));
            let qty = parseInt(newProd.qty);

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
                connection.query('INSERT INTO products (item_id, product_name, department_name, price, stock_quantity) VALUES (?,?,?,?,?)', [id, newProd.prod, newProd.dept, pr, qty], function (err, res) {
                    if (err) throw err;
                    console.log(`\n----------------------------\n`);
                    console.log(`${res.affectedRows} product updated as below:\n`);
                    console.log(`ITEM ID: ${id}  ||  ITEM NAME: ${newProd.prod}  ||  DEPARTMENT: ${newProd.dept}  ||  PRICE: $${pr}  ||  QUANTITY: ${qty}`);
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
                    'View Products for Sale',
                    'View Low Inventory',
                    'Add to Inventory',
                    'Add New Product'],
                name: 'action'
            }])
        .then((manage) => {

            switch (manage.action) {
                case 'View Products for Sale':
                    viewProds();
                    break;

                case 'View Low Inventory':
                    viewLow();
                    break;

                case 'Add to Inventory':
                    addQty();
                    break;

                case 'Add New Product':
                    addProd();
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