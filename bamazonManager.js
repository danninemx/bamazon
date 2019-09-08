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
    console.log(`\n----- CLOSING MANAGEMENT PORTAL -----\n\n\n`)
}

// Call this to list every available item: the item IDs, names, prices, and quantities.
let viewProds = async function () {
    await connection.query('SELECT item_id, product_name, price, stock_quantity FROM `products`', function (err, res) {
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

        console.log(`\n----- ${res.length} products have less than 5 units in stock. -----\n`);
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
let addMore = function () {
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

// let fulfillOrder = function (fi, fq, cu, pr) {
//     let newQty = cu - fq;
//     connection.query('UPDATE `products` SET ? WHERE item_id = ?',
//         [
//             {
//                 stock_quantity: newQty
//             },
//             fi
//         ],
//         function (err, res) {
//             if (err) throw err;

//             let total = pr * fq;
//             console.log(`\n----------------------------\n`);
//             console.log(`${res.affectedRows} product updated!\n`);
//             console.log(`Your total is $${total}.\n`);
//             console.log(`----------------------------\n`);
//             // console.log(res);
//             farewell();
//         })
// }


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
                    addMore();
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