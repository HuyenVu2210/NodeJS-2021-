const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})

// class Product {
//   constructor(title, imageUrl, price, description, id, userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId
//   }

//   save() {
//     let db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db.collection("products").updateOne(
//         { _id: this._id },
//         {
//           $set: {
//             title: this.title,
//             imageUrl: this.imageUrl,
//             price: this.price,
//             description: this.description,
//           },
//         }
//       );
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((results) => {
//         console.log(results);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     let db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         console.log(products + "fetched all");
//         return products;
//       })
//       .catch((err) => {
//         console.log(err + "fetch all failed");
//       });
//   }

//   static fetchById(prodId) {
//     let db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then((product) => {
//         console.log("product by id: " + product);
//         return product;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db.collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((results) => {
//         console.log(results);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

module.exports = mongoose.model('Product', productSchema);
