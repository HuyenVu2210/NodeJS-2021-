const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
// const rootDir = require('./util/path');

// Routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// Controllers
const errorsController = require("./controllers/errors");

// Database
const sequelize = require("./util/database");
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const Cart_item = require('./models/cart-item');

// Create app
const app = express();

app.set("view engine", "ejs");

// Store user in request
app.use((req, res, next) => {
  User.findByPk(1).then(user => {
    req.user = user;
    next();
  })
  .catch(err => {
    console.log(err)
  })
})

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use("/", errorsController.get404);

// Create relationship for models
// user & product --- one to many
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
// user & cart --- one to one 
Cart.belongsTo(User);
User.hasOne(Cart);
// cart & product --- many to many
Cart.belongsToMany(Product, { through: Cart_item });
Product.belongsToMany(Cart, { through: Cart_item });

sequelize
  // .sync({ force: true })
  .sync()
  .then((results) => {
    // console.log(results);
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({
        name: 'Huyen beo',
        email: 'huyenbeo@gmail.com'
      });
    }
    return user
  })
  .then(user => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
