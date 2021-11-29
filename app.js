const express = require("express");
const bodyParser = require("body-parser");
// const multer = require("multer");

const mongoose = require("mongoose");

const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

const csrf = require('csurf');

const flash = require('connect-flash');

const path = require("path");

// Routes
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

// staff model
const Staff = require("./models/staff");

// Controllers
const errorsController = require("./controllers/errors");

// Create app
const app = express();

app.set("view engine", "ejs");

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const MONGO_URI =
  "mongodb+srv://Kb3X1knoBJT4xRUR:Kb3X1knoBJT4xRUR@cluster0.6lc11.mongodb.net/StaffApp";
const store = new mongoDbSession({
  uri: MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrf());

// add isLoggedIn && csrfToken to render
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next()
})

// Store staff in request
app.use((req, res, next) => {
  if (!req.session.staff) {
    return next();
  };
  
  Staff.findById(req.session.staff._id)
    .then((staff) => {
      req.staff = staff;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// have to place use routes befor storing staff in request
app.use(adminRoutes);
app.use(authRoutes);


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
