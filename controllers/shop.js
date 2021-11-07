const Order = require("../models/order");
const Product = require("../models/product");

// get all products ==> /products
exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      console.log(products);
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
  Product.findById(prodId)
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
  Product.find()
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
    .populate("cart.items.productId")
    .then((user) => {
      let products = user.cart.items;
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

// add product to cart
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((results) => {
      res.redirect("/cart");
      console.log(results);
    });
  // .catch((err) => {
  //   console.log(err);
  // });
};

// Delete from cart
exports.deleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteFromCart(prodId)
    .then((results) => {
      console.log("deleted from cart");
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then(user => {
        let products = user.cart.items.map(i => {
            return {product: {...i.productId._doc}, quantity: i.quantity}    // _doc ???
        });
        console.log('products: ' + JSON.stringify(products))
        const order = new Order({
            user: {
              userId: req.user._id,
              name: req.user.name,
            },
            products: products,
          });
          console.log(order);
        return order.save();
    })
    .then((results) => {
      return req.user.clearCart();
    })
    .then(results => {
        res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        docTitle: "Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout" });
// };
