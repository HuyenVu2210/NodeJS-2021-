const Products = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const products = new Products(title, imageUrl, description, price);
  products.save();
  res.redirect("/products");
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/')
  }

  const prodId = req.params.productId;
  Products.fetchProductById(prodId, product => {
    if (!product) {
      return res.redirect('/')
    }
    res.render("admin/edit-product", {
      docTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product
    });
  })
};

exports.postEditProduct = (req, res, next) => {
  res.redirect("/products");
};

exports.getProducts = (req, res, next) => {
  Products.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      docTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};
