const getDb = require('../util/database').getDb;

class Product {
  constructor(title, imageUrl, price, description) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description
  }

  save() {
    let db = getDb();
    db.collection('products').insertOne(this)
    .then((results) => {
      console.log(results)
    })
    .catch(err => {
      console.log(err)
    })
  }
}

module.exports = Product;