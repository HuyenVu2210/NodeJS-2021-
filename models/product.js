const getDb = require("../util/database").getDb;

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
    let db = getDb;
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
}

module.exports = Product;
