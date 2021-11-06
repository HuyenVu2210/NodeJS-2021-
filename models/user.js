const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id
  }

  save() {
    let db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId) {
    let db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        return user;
      })
      .catch(err => {
          console.log(err)
      });
  }

  addToCart(product) {
      let db = getDb();
      product.quantity = 1;
      const updatedCart = {item: [{ productId: product._id, quantity: product.quantity }]}
      db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart }})
  }
}

module.exports = User;
