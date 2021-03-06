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

let farewell = function () {
    console.log(`\nTHANK YOU FOR CHOOSING BAMAZON.  PLEASE COME AGAIN!\n\n\n`)
    connection.end();
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
    table.push(['#', 'ITEM ID', 'ITEM NAME', 'PRICE($)']);

    // Loop through data, pretti-fy, push to table and print.
    let count = 0;
    for (ea of data) {
        count++;
        let prettyPrice = parseFloat(ea.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        table.push([count, ea.item_id, ea.product_name, prettyPrice]);
    }
    console.log(table.toString());
}

// Update DB with order details.
let fulfillOrder = function (fi, fq, cu, pr, sa) {
    let newQty = cu - fq;
    let newSales = sa + (pr * fq);
    connection.query('UPDATE `products` SET ? WHERE item_id = ?',
        [
            {
                stock_quantity: newQty,
                product_sales: newSales
            },
            fi
        ],
        function (err, res) {
            if (err) throw err;

            let total = parseFloat(pr * fq).toFixed(2);
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
    connection.query('SELECT item_id, price, stock_quantity, product_sales FROM `products` WHERE item_id = ?', [ci], function (err, res) {
        if (err) throw err;

        let price = res[0].price;
        let curr = res[0].stock_quantity;
        let sales = res[0].product_sales;

        // If current stock quantity is sufficient, fulfill order. Restart otherwise.
        if (curr > 0 && curr >= cq) {
            fulfillOrder(ci, cq, curr, price, sales)
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

        render(res);
        takeOrder();
    })
}

// Start on load.
if (!started) {
    started = true;
    start();
}
