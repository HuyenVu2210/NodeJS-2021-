const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
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
      .catch((err) => {
        console.log(err);
      });
  }

  getCart() {
      let db = getDb();
      let cartProductsId = this.cart.items.map(i => { return i.productId });
      return db.collection('products').find({ _id: { $in: cartProductsId }}).toArray().then(products => {
          return products.map(p => {
              return {...p, quantity: this.cart.items.find(i => { return i.productId.toString() === p._id.toString()}).quantity}
          })
      });
  }

  addToCart(product) {
    let db = getDb();
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items] ;

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    let updatedCart = { items: updatedCartItems };
    db.collection("users").updateOne(
      { _id: this._id },
      { $set: { cart: updatedCart } }
    );
  }
}

module.exports = User;
