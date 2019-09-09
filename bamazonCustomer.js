// Global variables
const mysql = require("mysql");
const inquirer = require('inquirer');
let started = false;

// DB connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
})

let farewell = function () {
    console.log(`\nTHANK YOU FOR CHOOSING BAMAZON.  PLEASE COME AGAIN!\n\n\n`)
    connection.end();
}

// Update DB with order details.
let fulfillOrder = function (fi, fq, cu, pr) {
    let newQty = cu - fq;
    connection.query('UPDATE `products` SET ? WHERE item_id = ?',
        [
            {
                stock_quantity: newQty
            },
            fi
        ],
        function (err, res) {
            if (err) throw err;

            let total = pr * fq;
            console.log(`\n----------------------------\n`);
            console.log(`${res.affectedRows} product updated!\n`);
            console.log(`Your total is $${total}.\n`);
            console.log(`----------------------------\n`);
            // console.log(res);
            farewell();
        })
    // // End DB conenction.
    // connection.end();
}

// Call this to check stock quantity.
let checkStock = function (ci, cq) {
    connection.query('SELECT item_id, price, stock_quantity FROM `products` WHERE item_id = ?', [ci], function (err, res) {
        if (err) throw err;

        // console.log(res);
        let price = res[0].price;
        let curr = res[0].stock_quantity;
        // console.log(price, ' ', curr);

        // If current stock quantity is sufficient, fulfill order. Restart otherwise.
        if (curr > 0 && curr >= cq) {
            fulfillOrder(ci, cq, curr, price)
        } else {
            console.log(`\n\n***** INSUFFICIENT AVAILABILITY (currently ${curr} in stock) *****\n`);
            takeOrder();
        }
    })
}

// Call this to start taking user's order.
let takeOrder = function () {
    console.log(`\n***** Please enter your order details *****\n`);
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
                checkStock(id, qty);
            } else {
                console.log(`\n***** Quantity has to be a positive integer. *****\n`);
                farewell();
            }
        })
}

// Call this to start customer interaction.
let start = function () {
    console.log(`***** Querying all products. *****\n`);

    // Query all items in "products" table.
    connection.query('SELECT item_id, product_name, price FROM `products`', function (err, res) {
        if (err) throw err;
        console.log(`***** ${res.length} matches found. *****\n`);

        // Loop through the result and output each.
        let count = 0;
        for (ea of res) {
            count++;
            console.log(`${count}) ITEM ID: ${ea.item_id} || ITEM NAME: ${ea.product_name} || PRICE: $${ea.price}`);
        }
        takeOrder();
    })
}

// Start on load.
if (!started) {
    started = true;
    start();
}
