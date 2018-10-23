var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

function start() {
  console.log("Items Available for Sale:\n");   

  connection.query("SELECT item_id,product_name,price FROM products", function(err, res) {
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

function placeOrder() {
    
    inquirer
      .prompt([
        {
          name: "item",
          type: "input",
          message: "What is the ID of the item you would like to buy?"
        },
        {
          name: "quantity",
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
        connection.query(
            "SELECT * FROM products",
            {
              item_id: answer.item,
              stock_quantity: answer.quantity
            },
            function(err, results) {
              if (err) throw err;
              console.log("Your purchase order was created successfully!");
    
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
        // console.log(results.length); //3 x 3
        // console.log(answer);
          if (results[i].item_id === answer.item) {
            chosenItem = results[i];
            console.log("You chose: " + chosenItem.product_name);
            // console.log(chosenItem);
            updateProducts();
          } else {
              console.log("Try Again");
            //   start();
          }
        };
        },
      )
    });
}

function updateProducts() {
        
          connection.query("UPDATE products SET ? WHERE ?", function(error, results){ [
              {
                stock_quantity: (stock_quantity - answer.quantity)
              },
              {
                item_id: answer.item
              }
            ],
            function(error) {
              if (error) throw err;

              console.log("Bid placed successfully!");
          }
          
          if (answer.quantity < results[i].stock_quantity) {

          console.log("Good job!");
        } 
        
        else {
          console.log("Your bid was too low. Try again...");
          start();
        }
    })
}
 