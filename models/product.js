const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class Product {
  constructor(title, imageUrl, price, description, id) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
    this._id = id;
  }

  save() {
    let db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne(
          { _id: new mongodb.ObjectId(this._id) },
          {
            $set: {
              title: this.title,
              imageUrl: this.imageUrl,
              price: this.price,
              description: this.description,
            },
          }
        );
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp
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
