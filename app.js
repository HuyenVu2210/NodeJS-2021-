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

// Create app
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use("/", errorsController.get404);

sequelize
  .sync()
  .then((results) => {
    // console.log(results);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
