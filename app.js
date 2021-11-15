const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const path = require("path");

// Routes
const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

// staff model
const Staff = require("./models/staff");

// Controllers
const errorsController = require("./controllers/errors");

// Create app
const app = express();

app.set("view engine", "ejs");

// Store staff in request
app.use((req, res, next) => {
  Staff.findById("618a7451aec73aa797233ca0")
    .then((staff) => {
      req.staff = staff;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use(adminRoutes);

app.use("/", errorsController.get404);

mongoose
  .connect(
    "mongodb+srv://Kb3X1knoBJT4xRUR:Kb3X1knoBJT4xRUR@cluster0.6lc11.mongodb.net/StaffApp?retryWrites=true&w=majority"
  )
  .then((results) => {
    app.listen(3000);
    Staff.findOne() // findOne with no argument give back the first one
      .then((staff) => {
        if (!staff) {
          const staff = new Staff({
            name: "Huyen",
            doB: "2010-10-20",
            salaryScale: 1,
            startDate: "2010-10-20",
            department: "HR",
            annualLeave: 12,
            image: "//",
          });
          staff.save();
        }
      });
  })
  .catch((err) => {
    console.log(err);
  });
