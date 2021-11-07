const express = require("express");
// const path = require('path');

// const rootDir = require('../util/path');
// const adminData = require("./admin");

const shopController = require('../controllers/shop');

const router = express.Router();

//Products

router.get("/", shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/product/:productId', shopController.getProduct);

// // //Cart

// router.get('/cart', shopController.getCart);

// router.post('/cart', shopController.postCart);

// router.post('/delete-cart-product', shopController.deleteCartProduct);

// // // Order
// router.post('/orders', shopController.postOrder);

// router.get('/orders', shopController.getOrders);



// router.get('/checkout', shopController.getCheckout);

module.exports = router;
