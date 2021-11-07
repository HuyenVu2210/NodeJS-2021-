const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');

const path = require("path");
// const rootDir = require('./util/path');

// Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// user model
// const User = require('./models/user');

// Controllers
const errorsController = require("./controllers/errors");

// Create app
const app = express();

app.set("view engine", "ejs");

// Store user in request
// app.use((req, res, next) => {
//   User.findById('6186750a4b187bac5e7c3f14').then(user => {
//     req.user = new User(user.name, user.email, user.cart, user._id);
//     next();
//   })
//   .catch(err => {
//     console.log(err)
//   })
// });

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use("/", errorsController.get404);

mongoose.connect('mongodb+srv://Kb3X1knoBJT4xRUR:Kb3X1knoBJT4xRUR@cluster0.6lc11.mongodb.net/shop?retryWrites=true&w=majority')
.then((results) => {
  app.listen(3000)
})
.catch(err => {
  console.log(err)
})