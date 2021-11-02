const Products = require("../models/product");
const Cart = require("../models/cart");

// get all products ==> /products
exports.getProducts = (req, res, next) => {
  Products.findAll()
    .then((products) => {
      // console.log(rows);
      res.render("shop/product-list", {
        prods: products,
        docTitle: "Shop",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// get a single product /products/id
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Products.findAll({ where: {
  //   id: prodId
  // }}).then(
  //   (product) => {
  //     res.render('shop/product-detail', {
  //       product: product[0],
  //       docTitle: product[0].title,
  //       path: '/products'
  //     })
  //   }
  // ).catch(err => { console.log(err) })
  Products.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        docTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// get all products ==> /
exports.getIndex = (req, res, next) => {
  Products.findAll()
    .then((products) => {
      // console.log(rows);
      res.render("shop/index", {
        prods: products,
        docTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Cart
// get cart ==> /cart
exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      console.log(cart);
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        docTitle: "Your cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Products.fetchProductById(prodId, (product) => {
    Cart.addToCart(product.id, product.price);
    res.redirect("/cart");
  });
};

exports.deleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Products.fetchProductById(prodId, (product) => {
    Cart.deleteById(prodId, product.price);
    res.redirect("/cart");
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", { path: "/orders", docTitle: "Your orders" });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout" });
};
