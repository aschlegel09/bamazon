var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

// display all of the items available for sale
function start() {
  console.log("Items Available for Sale:\n");

  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    for (var x = 0; x < res.length; x++) {
      console.log(
        "ID: " +
          res[x].item_id +
          "\nProduct Name: " +
          res[x].product_name +
          "\nPrice: " +
          res[x].price +
          "\n---------------"
      );
    }
    placeOrder();
  });
}

// fulfill the customer's order
function placeOrder() {
  console.log("Create your Purchase Order");

  connection.query(
    "SELECT item_id,product_name,price,stock_quantity FROM products",
    function(err, results) {
      if (err) throw err;
      // ID of the product and how many units
      inquirer
        .prompt([
          {
            name: "product",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].product_name);
              }
              return choiceArray;
            },
            message: "Which product would you like to buy?"
          },
          {
            name: "stock",
            type: "input",
            message: "How many units would you like to purchase?",
            validate: function(value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            }
          }
        ])
        .then(function(answer) {
          // get the information of the chosen item
          var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].product_name === answer.product) {
              console.log((chosenItem = results[i]));
            }
          }
          if (answer.stock < chosenItem.stock_quantity) {
            console.log("Your order was successful!");

            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity:
                    parseInt(chosenItem.stock_quantity) - parseInt(answer.stock)
                },
                {
                  product_name: answer.product
                }
              ],
              function(error) {
                if (error) throw err;

                console.log("\nBid placed successfully!\n");
                console.log("Your order costs a total of $" + chosenItem.price + " dollars.");
                console.log("------------------");
                // start();
              }
            );
          } else {
            console.log(
              "\nThe quantity requested exceeds our current inventory count. Try again..."
            );
            console.log("------------------\n");
            // start();
          }
        });
    }
  );
}

// update the store with what the customer purchased
// function updateProducts() {

//   var chosenItem = results[i];
//   // get the information of the chosen item
//     if (chosenItem.product_name === answer.product) {
//       console.log((chosenItem = results[i]));
//     }

//   };
