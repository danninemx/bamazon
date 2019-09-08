// Global variables
const mysql = require("mysql");
const inquirer = require('inquirer');

// DB connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
})

// Update DB with order details.
let fulfillOrder = function (fi, fq, cu) {
    let newQty = parseInt(cu) - parseInt(fq);
    connection.query('UPDATE `products` SET ? WHERE item_id = ?',
        [
            {
                stock_quantity: newQty
            },
            fi
        ],
        function (err, res) {

            if (err) throw err;
            console.log(res.affectedRows + " product updated!\n");
            // console.log(res);
        })


    // End DB conenction.
    connection.end();
}

// Call this to check stock quantity.
let checkStock = function (ci, cq) {
    connection.query('SELECT item_id, stock_quantity FROM `products` WHERE item_id = ?', [ci], function (err, res) {
        if (err) throw err;

        // If current stock quantity is sufficient, fulfill order. Restart otherwise.
        let curr = res[0].stock_quantity;
        if (curr > 0 && curr >= cq) {
            fulfillOrder(ci, cq, curr)
        } else {
            console.log(`\n*** Insufficient quantity! ***\n`);
            takeOrder();
        }
    })
}

// Call this to let user place order.
let takeOrder = function () {
    console.log(`\n*** Placing order ***\n`);
    return inquirer
        .prompt([
            {
                type: 'input',
                message: 'Please enter the ITEM ID of the item you wish to purchase.',
                name: 'id'
            },
            {
                type: 'input',
                message: 'How many units would you like to purchase?',
                name: 'quantity'
            }])
        .then((order) => {
            let id = order.id;
            let qty = parseInt(order.quantity);
            checkStock(id, qty);
        })
}

console.log(`*** Querying all products. ***\n`);

// Query all items in "products" table.
connection.query('SELECT item_id, product_name, price FROM `products`', function (err, res) {
    if (err) throw err;

    console.log(`*** ${res.length} matches found. ***\n`);

    // Loop through the result and output each.
    let count = 0;
    for (ea of res) {
        count++;
        console.log(`${count}) ITEM ID: ${ea.item_id} || ITEM NAME: ${ea.product_name} || PRICE: $${ea.price}`);
    }

    // console.log(`\n*** End of query. ***\n`);

    takeOrder();
});