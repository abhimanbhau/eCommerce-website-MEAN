// ENTER AWS API KEY and SECRET KEY HERE
const AWS_ACCESS_KEY = "";
const AWS_SECRET_KEY = "";

// Seller.JS file to maintain every sellers details and storing the resources on AWS

//Including the required packages and assigning it to Local Variables
const router = require("express").Router();
const Product = require("../models/product");
const mongoose = require("mongoose");

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
});

const faker = require("faker");

const checkJWT = require("../middlewares/check-jwt");

//function to upload resources to AWS using multer service
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "wpl-final-project",
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname
      });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

router.route("/products/:id").post((req, res) => {
  Product.findByIdAndUpdate({
      _id: req.params.id
    }, {
      isDeleted: true
    },
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

//Function to handle the product's GET and POST requests by seller
router
  .route("/products")
  .get(checkJWT, (req, res, next) => {
    Product.find({
        owner: req.decoded.user._id
      })
      .populate("owner")
      .populate("category")
      .exec((err, products) => {
        if (products) {
          res.json({
            success: true,
            message: "Products",
            products: products,
          });
        }
      });
  })
  .post([checkJWT, upload.single("product_picture")], (req, res, next) => {
    console.log(upload);
    console.log(req.file);
    let product = new Product();
    product.owner = req.decoded.user._id;
    product.category = req.body.categoryId;
    product.title = req.body.title;
    product.price = req.body.price;
    product.quantity = req.body.quantity;
    product.description = req.body.description;
    product.image = req.file.location;
    product.isDeleted = false;
    product.save();
    res.json({
      success: true,
      message: "Successfully Added the product",
    });
  });

router
  .route("/editproducts")
  .post([checkJWT, upload.single("product_picture")], (req, res, next) => {
    Product.findByIdAndUpdate({
        _id: req.body.id
      }, {
        owner: req.decoded.user._id,
        category: req.body.categoryId,
        title: req.body.title,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: req.file.location,
        isDeleted: req.body.isDeleted,
      },
      (err, result) => {
        if (err) {
          res.json({
            success: false,
            message: err,
          });
        } else
          res.json({
            success: true,
            message: "Successfully updated the product",
          });
      }
    );
  });

/* Just for testing if products are added*/
router.get("/faker/test", (req, res, next) => {
  for (i = 0; i < 15; i++) {
    let product = new Product();
    product.category = "5acc1902580ba509c6622bd7";
    product.owner = "5acbfed6571913c9a9e98135";
    product.image = faker.image.cats();
    product.title = faker.commerce.productName();
    product.description = faker.lorem.words();
    product.price = faker.commerce.price();
    product.save();
  }

  res.json({
    message: "Successfully added 20 pictures",
  });
});

//Exporting the module
module.exports = router;