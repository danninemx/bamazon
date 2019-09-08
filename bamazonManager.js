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

// Call this process.
let farewell = function () {
    console.log(`\n----- PROCESS COMPLETE. -----\n\n\n`)
    connection.end();
}


// Call this to list every available item: the item IDs, names, prices, and quantities.
let viewProds = function () {
    connection.query('SELECT item_id, product_name, price, stock_quantity FROM `products`', function (err, res) {
        if (err) throw err;

        console.log(`\n----- ${res.length} products found. -----\n`);
        let count = 0;
        for (ea of res) {
            count++;
            console.log(`${count})  ITEM ID: ${ea.item_id}  ||  ITEM NAME: ${ea.product_name}  ||  PRICE: $${ea.price}  ||  QUANTITY: ${ea.stock_quantity}`);
        }
        farewell();
        // If current stock quantity is sufficient, fulfill order. Restart otherwise.
        // if (curr > 0 && curr >= cq) {
        //     fulfillOrder(ci, cq, curr, price)
        // } else {
        //     console.log(`\n\n----- INSUFFICIENT AVAILABILITY (currently ${curr} in stock) -----\n`);
        //     takeOrder();
        // }
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
                    break;

                case 'Add to Inventory':
                    break;

                case 'Add New Product':
                    break;

                default:
                    console.log('Easter egg!')
                    return;
            }
            // Validate quanity.
            // let id = order.id.toString().trim();
            // let qty = parseInt(order.quantity);
            // if (typeof qty === 'number' && qty > 0) {
            //     checkStock(id, qty);
            // } else {
            //     console.log(`\n----- Quantity has to be a positive integer. -----\n`);
            //     farewell();
            // }
        })
}




// Start on load.
if (!started) {
    started = true;
    start();
}
