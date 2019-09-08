DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products (
    `id` INT NOT NULL AUTO_INCREMENT,
    `item_id` VARCHAR(50) NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `department_name` VARCHAR(100),
    `price` DECIMAL(10, 2) NOT NULL,
    `stock_quantity` INTEGER NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('m100', "Mountain Bike 1", "Sports", 100.00, 10);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('m200', "Mountain Bike 2", "Sports", 200.00, 8);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('m300', "Mountain Bike 3", "Sports", 300.00, 5);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('m400', "Mountain Bike 4", "Sports", 400.00, 3);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('m500', "Mountain Bike 5", "Sports", 500.00, 1);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('miph8', "miPhone 8", "Electronics", 200.00, 20);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('miph9', "miPhone 9", "Electronics", 300.00, 30);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('miph9s', "miPhone 9s", "Electronics", 350.00, 40);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('miphX', "miPhone X", "Electronics", 400.00, 50);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES ('best_movie', "Office Space DVD", "Media", 30.00, 10);


SELECT * FROM products;