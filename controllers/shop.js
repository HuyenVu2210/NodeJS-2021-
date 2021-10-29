const Products = require("../models/product");

exports.getProducts = (req, res, next) => {
  Products.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      docTitle: "All products",
      path: "/product",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Products.fetchProductById(prodId, (product) => {
    console.log(product);
    res.redirect('/');
  })
}

exports.getIndex = (req, res, next) => {
  Products.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      docTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', { path: '/cart', docTitle: "Your cart" })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { path: '/orders', docTitle: "Your orders" })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { path: '/checkout', docTitle: "Checkout" })
}
