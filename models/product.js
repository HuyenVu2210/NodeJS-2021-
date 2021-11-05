const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class Product {
  constructor(title, imageUrl, price, description) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    let db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then((results) => {
        console.log(results);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    let db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products + "fetched all");
        return products;
      })
      .catch((err) => {
        console.log(err + "fetch all failed");
      });
  }

  static fetchById(prodId) {
    let db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => {
        console.log("product by id: " + product);
        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Product;
