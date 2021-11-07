const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  let updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  let updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

module.exports = mongoose.model('User', userSchema)

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     let db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   static findById(userId) {
//     let db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new ObjectId(userId) })
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   getCart() {
//     let db = getDb();
//     let cartProductsId = this.cart.items.map((i) => {
//       return i.productId;
//     });
//     return db
//       .collection("products")
//       .find({ _id: { $in: cartProductsId } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find((i) => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   addToCart(product) {
//     let db = getDb();
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     let updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     let updatedCart = { items: updatedCartItems };
//     db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) },
//       { $set: { cart: updatedCart } }
//     );
//   }

//   deleteFromCart(prodId) {
//     let updatedCartItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== prodId.toString();
//     });
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart().then((products) => {
//       const order = {
//         items: products,
//         user: {
//           _id: new ObjectId(this._id),
//           name: this.name,
//         },
//       };
//       return db
//         .collection("orders")
//         .insertOne(order)
//         .then((results) => {
//           this.cart = { items: [] };
//           return db
//             .collection("users")
//             .updateOne(
//               { _id: new ObjectId(this._id) },
//               { $set: { cart: { items: [] } } }
//             );
//         });
//     });
//   }

//   getOrders() {
//       const db = getDb();
//       return db.collection('orders').find({ 'user._id' : new ObjectId(this._id) }).toArray();
//   }
// }

// module.exports = User;
