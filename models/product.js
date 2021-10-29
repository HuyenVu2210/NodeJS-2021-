const fs = require("fs");
const path = require("path");

const p = path.join(
    path.dirname(process.mainModule.filename),
    "data",
    "products.json"
  );

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    }
    cb(JSON.parse(fileContent));
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      // check if product already existed
      if (this.id) {
        console.log('thisId' + this.id);
        const existingProductIndex = products.findIndex(product => product.id === this.id );
        console.log('index' + existingProductIndex);
        // deep copy products array
        const updatedProducts = [...products];

        // change the existing product to this (updated product)
        updatedProducts[existingProductIndex] = this;
        // console.log(updatedProducts);

        // change the products array to updatedProducts
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err + ' edit failed');
        });
      } else {
        this.id = Math.random().toString();

        // add new product to products array
        products.push(this);

        // change to new products array
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err + ' save failed');
        });
      }
    });
  }


  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static fetchProductById = (id, cd) => {
    getProductsFromFile((products) => {
      const productById = products.find(prod => prod.id === id);
      cd(productById);
    });
  }
};
