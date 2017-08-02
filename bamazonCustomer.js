var mysql = require("mysql");
var inquire = require("inquirer");
var Table = require('cli-table2');

// create the connection information for the Mysql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  //username
  user: "root",

  //password
  password: "",
  database: "bamazon_DB"
});
connection.connect(function(err) {
  if (err) {
    console.log("error connnecting: " + err.stack);
  }
  makeTable();
});
// function connects to database and displays table
var makeTable = function() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw error;
    var table = new Table({
      head: ['Item ID', 'Product Name', 'Department Name', 'Price', 'Stock Quantity']
    });
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
    }
    console.log(table.toString());
    promptCustomer(res);
  });
};
// function prompts the customer & depletes stock if something is purchased
var promptCustomer = function(res) {
  inquire.prompt([{
    type: 'input',
    name: 'choice',
    message: ' What would you like to purchase? [Quit with Q]'
  }]).then(function(val) {
    var correct = false;
    for (var i = 0; i < res.length; i++) {
      if (res[i].product_name === val.choice) {
        correct = true;
        var product = val.choice;
        var id = i;
        inquire.prompt([{
          type: 'input',
          name: 'quant',
          message: 'How many would you like to buy?'
        }]).then(function(val) {
          if ((res[id].stock_quantity - val.quant) > 0) {
            connection.query(
              "UPDATE products SET stock_quantity='" + (res[id].stock_quantity - val.quant) +
              "' WHERE product_name='" + product + "'",
              function(err, res2) {
                if (err) {
                  throw err;
                }
                console.log("Purchase successful.");
                makeTable();
              });
          } else {
            console.log("Not a Valid choice!!");
            promptCustomer(res);
          }
        });
      }
      if (val.choice == "Q" || val.choice == "q") {
        process.exit();
      }
    }
    if (i === res.length && correct === false) {
      console.log("Not a valid selection");
      promptCustomer(res);
    }
  });
}
