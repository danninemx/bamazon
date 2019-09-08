// GLOBAL VARIABLES
const mysql = require("mysql");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
})

console.log(`*** Querying all products. ***\n`);

// Query all items in "products" table.
connection.query('SELECT item_id, product_name, price FROM `products`', function (err, res) {
    if (err) throw err;

    console.log(`*** ${res.length} matches found. ***\n`);

    // Loop through the result and output each.
    let count = 0;
    for (ea of res) {
        console.log(`${count}) ITEM ID: ${ea.item_id} || ITEM NAME: ${ea.product_name} || PRICE: $${ea.price}`);
        count++;
    }
    connection.end();
});
