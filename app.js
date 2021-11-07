const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');

const path = require("path");
// const rootDir = require('./util/path');

// Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// user model
const User = require('./models/user');

// Controllers
const errorsController = require("./controllers/errors");

// Create app
const app = express();

app.set("view engine", "ejs");

// Store user in request
app.use((req, res, next) => {
  User.findById('6187ce322f227162af1a53ef').then(user => {
    req.user = user;
    next();
  })
  .catch(err => {
    console.log(err)
  })
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use("/", errorsController.get404);

mongoose.connect('mongodb+srv://Kb3X1knoBJT4xRUR:Kb3X1knoBJT4xRUR@cluster0.6lc11.mongodb.net/shop?retryWrites=true&w=majority')
.then((results) => {
  app.listen(3000);
  User.findOne()    // findOne with no argument give back the first one
  .then(user => {
    if(!user) {
      const user = new User({
        name: 'Huyen',
        email: 'Huyen@beo.com',
        cart: []
      });
      user.save()
    }
  })
})
.catch(err => {
  console.log(err)
})