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

function start() {
  inquirer
    .prompt([
      {
        name: "viewOrAdd",
        type: "rawlist",
        message: "Would you like to View or Add to Products?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
      }
    ])
    .then(function(answer) {
      if (answer.viewOrAdd === "View Products for Sale") {
        itemsForSale();
      } else if (answer.viewOrAdd === "View Low Inventory") {
        lowStock();
      } else if (answer.viewOrAdd === "Add to Inventory") {
        addStock();
      } else if (answer.viewOrAdd === "Add New Product") {
        addNewItem();
      } else {
        console.log("Enter the number corresponding to your choice");
        start();
      }
    });
}

// the app should list every available item: the item IDs, names, prices, and quantities
function itemsForSale() {
  console.log("\nItems Available for Sale: ");
  connection.query(
    "SELECT item_id,product_name,price,stock_quantity FROM products",
    function(err, res) {
      if (err) throw err;

      for (var x = 0; x < res.length; x++) {
        console.log(
          "ID: " +
            res[x].item_id +
            "\nProduct Name: " +
            res[x].product_name +
            "\nPrice: " +
            res[x].price +
            "\nInventory: " +
            res[x].stock_quantity +
            "\n---------------"
        );
      }
      start();
    }
  );
}
// list all items with an inventory count lower than five.
function lowStock() {
  console.log("Stocking");
  connection.query(
    "SELECT item_id,product_name,price,stock_quantity FROM products",
    function(err, res) {
      if (err) throw err;

      for (var x = 0; x < res.length; x++) {
        if (res[x].stock_quantity <= 5) {
          console.log(
            "\nItems with Low Stock Count: " +
              "\nID: " +
              res[x].item_id +
              "\nProduct Name: " +
              res[x].product_name +
              "\nPrice: " +
              res[x].price +
              "\nInventory: " +
              res[x].stock_quantity +
              "\n---------------"
          );
        }
      }
      start();
    }
  );
}
// display a prompt that will let the manager "add more" of any item currently in the store.
function addStock() {
  console.log("Add to an existing Item");
  // query the database for all items 
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

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
          message: "Which Product would you like to Add to?"
        },
        {
          name: "add",
          type: "input",
          message: "How much would you like to Add to its Inventory?"
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

        if (parseInt(answer.add) > 0) {
          console.log(
            "\nYou're adding " + answer.add + " to " + chosenItem.product_name
          );
          // when finished prompting, insert a new item into the db with that info
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity:
                  parseInt(chosenItem.stock_quantity) + parseInt(answer.add)
              },
              {
                product_name: answer.product
              }
            ],

            function(error) {
              if (error) throw err;
              console.log("\nProduct updated successfully!\n");
              start();
            }
          );
        } else {
          console.log("\nTry a different value\n");
          addStock();
        }
      });
  });
}

// add a completely new product to the store.
function addNewItem() {
  console.log("\nAdd a New Product\n");

  inquirer.prompt([
    {
      name: "product",
      type: "input",
      message: "What is the name of the product you are adding to your store?"
    },
    {
      name: "department",
      type: "input",
      message: "What department is this product in?"
    },
    {
      name: "price",
      type: "input",
      message: "How much would you like to charge for this product?"
    },
    {
      name: "quantity",
      type: "input",
      message: "How much of this product is in stock?"
    }
  ])
  .then(function(answer) {
  var query = connection.query(
    "INSERT INTO products SET ?",
    {
      product_name: answer.product,
      department_name: answer.department,
      price: answer.price,
      stock_quantity: answer.quantity
    },
    function(err, res) {
      if (err) {console.log("Try again.")};
      start();
    }
  );
  console.log(query.sql);
});
}
