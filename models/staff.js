const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const staffSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  doB: {
    type: Date,
    required: true
  },
  salaryScale : {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  annualLeave: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

// userSchema.methods.addToCart = function(product) {      // why arrow function does not get the context of this?
//   const cartProductIndex = this.cart.items.findIndex((cp) => {
//     return cp.productId.toString() === product._id.toString();
//   });
//   let newQuantity = 1;
//   let updatedCartItems = [...this.cart.items];

//   if (cartProductIndex >= 0) {
//     newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//     updatedCartItems[cartProductIndex].quantity = newQuantity;
//   } else {
//     updatedCartItems.push({
//       productId: product._id,
//       quantity: newQuantity,
//     });
//   }

//   let updatedCart = { items: updatedCartItems };
//   this.cart = updatedCart;
//   return this.save();
// };

// userSchema.methods.deleteFromCart = function(prodId) {
//   let updatedCartItems = this.cart.items.filter((item) => {
//     return item.productId.toString() !== prodId.toString();
//   });
//   this.cart.items = updatedCartItems;
//   return this.save()
// };

// userSchema.methods.clearCart = function() {
//   this.cart = { items: [] };
//   return this.save()
// }

module.exports = mongoose.model('Staff', staffSchema)

