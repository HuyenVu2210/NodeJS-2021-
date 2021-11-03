const Cart = require("../models/cart");
const Product = require("../models/product");

// get all products ==> /products
exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findAll()
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
      // console.log('products in cart: ' + JSON.stringify(products));
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
  let fetchedCart;
  let newQuantity;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      newQuantity = 1;
      if (products.length > 0) {
        product = products[0];
      }

      // if product already in the cart
      if (product) {
        const oldQuantity = product.cart_item.quantity;
        newQuantity = oldQuantity + 1;
        // console.log(oldQuantity, newQuantity)
        return product; // this return product to get executed in the next then
      }
      return Product.findByPk(prodId); // this return product also get executed in the next line
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

// Delete from cart
exports.deleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cart_item.destroy();
    })
    .then((results) => {
      console.log("deleted from cart");
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  let products;
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((prods) => {
      products = prods;
      return req.user.createOrder();
    })
    .then((order) => {
      return order.addProducts(
        products.map((product) => {
          product.order_item = { quantity: product.cart_item.quantity };
          return product;
        })
      );
    })
    .then((results) => {
      return fetchedCart.setProducts(null);
    })
    .then((results) => {
      res.render("shop/orders", { path: "/orders", docTitle: "Your orders" });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
  .then(orders => {
    res.render("shop/orders", { path: "/orders", docTitle: "Orders", orders: orders });
  })
  .catch(err => {
    console.log(err)
  })
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout" });
};
