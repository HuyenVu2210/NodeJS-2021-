const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  constructor() {
    (this.products = []), (this.price = 0);
  }

  static addToCart(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalprice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalprice = cart.totalprice + parseFloat(productPrice);
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteById(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }

      const cart = JSON.parse(fileContent);
      const product = cart.products.find((prod) => prod.id === id);
      if (!product) {
          return;
      }
      const updatedCart = {...cart};
      updatedCart.products = cart.products.filter((prod) => prod.id !== id);
      updatedCart.totalprice =
        updatedCart.totalprice - parseFloat(productPrice) * product.qty;
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
          cb(null)
        }
        const cart = JSON.parse(fileContent);
        cb(cart);
      });
  }
};
