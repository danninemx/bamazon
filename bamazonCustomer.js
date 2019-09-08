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

let takeOrder = function () {
    inquirer.prompt([
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
            let id = order.id.trim();
            let qty = parseInt(order.quantity);

            console.log(`ITEM ID = ${id}
            QUANTITY = ${qty}`);
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

    connection.end();
});
