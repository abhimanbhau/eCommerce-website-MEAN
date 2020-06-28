//Product-search.JS file to provide functionality to search for products using ALGOLIA API

//Including the required packages and assigning it to Local Variables
const router = require("express").Router();
const async = require("async");
const algoliasearch = require("algoliasearch");
const client = algoliasearch("KW06GS4929", "ca7080fd8e24ae3f2ad56e68af784fc5");
const index = client.initIndex("Ecommercever1");

const Category = require("../models/category");
const Product = require("../models/product");
const Review = require("../models/review");
const Order = require("../models/order");

//Function providing product search functionality
router.get("/", (req, res, next) => {
  const perPage = 10;
  const page = req.query.page;
  console.log(req.query.query);
  var regex = new RegExp([req.query.query].join(""), "i");
  console.log(regex);
  async.parallel(
    [
      function (callback) {
        Product.count({}, (err, count) => {
          var totalProducts = count;
          callback(err, totalProducts);
        });
      },
      function (callback) {
        Product.find({
            isDeleted: false,
            title: regex
          })
          .skip(perPage * page)
          .limit(perPage)
          .populate("category")
          .populate("owner")
          .exec((err, products) => {
            if (err) return next(err);
            callback(err, products);
          });
      },
    ],
    function (err, results) {
      var totalProducts = results[0];
      var products = results[1];

      res.json({
        success: true,
        message: "Product",
        products: products,
        totalProducts: totalProducts,
        pages: Math.ceil(totalProducts / perPage),
        currentProducts: products.length,
      });
    }
  );

  // console.log(req.query);
  // if (req.query.query) {
  //   index.search(
  //     {
  //       query: req.query.query,
  //       //price: req.
  //       page: req.query.page,
  //     },
  //     (err, content) => {
  //       let con = [];
  //       if (content) {
  //         con = content;
  //       }
  //       res.json({
  //         success: true,
  //         message: "Here is your search",
  //         status: 200,
  //         content: con,
  //         search_result: req.query.query,
  //       });
  //     }
  //   );
  // }
});

//Exporting the module
module.exports = router;