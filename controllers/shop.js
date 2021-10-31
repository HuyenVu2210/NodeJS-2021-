const Products = require("../models/product");
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Products.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      docTitle: "All products",
      path: "/products",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Products.fetchProductById(prodId, (product) => {
    res.render('shop/product-detail', {
      product: product,
      docTitle: product.title,
      path: '/products'
    })
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

// Cart

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Products.fetchAll(products => {
      const cartProducts = [];
      for (product of products) {
        const cartProduct = cart.products.find(prod => prod.id === product.id);
        if (cartProduct) {
          cartProducts.push({ productData: product, qty: cartProduct.qty});
        }
      }
      res.render('shop/cart', { path: '/cart', docTitle: "Your cart", products: cartProducts })
    })
  })
}

exports.postCart =  (req, res, next) => {
  const prodId = req.body.productId;
  Products.fetchProductById(prodId, product => {
    Cart.addToCart(product.id, product.price);
    res.redirect('/cart');
  })
}

exports.deleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Products.fetchProductById(prodId, product => {
    Cart.deleteById(prodId, product.price);
    res.redirect('/cart');
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { path: '/orders', docTitle: "Your orders" })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { path: '/checkout', docTitle: "Checkout" })
}
