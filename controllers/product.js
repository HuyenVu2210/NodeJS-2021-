const Products = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render("add-product", {
      docTitle: "Add Product",
      path: "/admin/add-product"
    });
  };

exports.postAddProduct = (req, res, next) => {
    const products = new Products(req.body.title);
    products.save();
    res.redirect("/");
  };

exports.getProduct = (req, res, next) => {
    Products.fetchAll(products => {
        res.render("shop", {
            prods: products,
            docTitle: "Shop",
            path: "/",
          });
    });
  }