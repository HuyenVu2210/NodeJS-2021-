const Product = require('../models/product');
const Checkin = require('../models/checkin')
// const User = require("../models/user");

// const mongodb = require("mongodb");
// const ObjectId = mongodb.ObjectId;

// exports.getAddProduct = (req, res, next) => {
//   res.render("admin/edit-product", {
//     docTitle: "Add Product",
//     path: "/admin/add-product",
//     editing: false,
//   });
// };

// // Add product
// exports.postAddProduct = (req, res, next) => {
//   const title = req.body.title;
//   const imageUrl = req.body.imageUrl;
//   const description = req.body.description;
//   const price = req.body.price;
//   const product = new Product({
//       title: title,
//       imageUrl: imageUrl,
//       description: description,
//       price: price,
//       userId: req.user._id    // can also only write req.user then mongoose will only extract the _id
//   });
//   product
//     .save()
//     .then((results) => {
//       console.log(results);
//       console.log("product created!");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// show staff info /
exports.getStaffDetail = (req, res, next) => {
  const Staff = req.staff;
  res.render("staff-detail", {
    staff: Staff,
    docTitle: Staff.name,
    path: "/staff",
  });
};

// get edit page /edit-staff
exports.getEditStaff = (req, res, next) => {
  const Staff = req.staff;
  res.render("edit-staff", {
    staff: Staff,
    docTitle: Staff.name,
    path: "/edit-staff",
  });
};

// post edit /edit-staff
exports.postEditStaff = (req, res, next) => {
  const image = req.body.image;
  const Staff = req.staff;
  Staff.image = image;
  Staff.save()
    .then((results) => {
      console.log("edited staff");
      res.redirect("/staff");
    })
    .catch((err) => {
      console.log("post edit failed: " + err);
    });
};

// get check in
exports.getCheckIn = (req, res, next) => {
  const Staff = req.staff;
  let isCheckedIn = false;
  Checkin.find({'staff.staffId': req.staff._id, end: null}).then(checkin => {
    if (checkin.length > 0) {
      console.log()
      isCheckedIn = true;
    }
    res.render('check-in', {
      staff: Staff,
      docTitle: Staff.name,
      path: "/",
      isCheckedIn: isCheckedIn
    });
  })
  .catch(err => {
    console.log(err)
  })
};

// post checkin 
exports.postCheckIn = (req, res, next) => {
  Checkin.find({'staff.staffId': req.staff._id, end: null})
  .then(c => {
    if (c.length > 0) {
      let existingCheckin = c[0];
      const checkout_time = new Date;
      existingCheckin.end = checkout_time;
      existingCheckin.save()
      .then((results) => {
        console.log("checked in/out");
        res.redirect("/");
      })
      .catch((err) => {
        console.log("post checkin failed: " + err);
      });
    } else {
      let checkin = new Checkin;
      const workplace = req.body.workplace;
      const checkin_time = new Date();
      checkin.workplace = workplace;
      checkin.start = checkin_time;
      checkin.staffId = req.staff._id;
      checkin.save()
      .then((results) => {
        console.log("checked in/out");
        res.redirect("/");
      })
      .catch((err) => {
        console.log("post checkin failed: " + err);
      });
    }
  })
};

// delete product
// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findByIdAndRemove(prodId)
//     .then((results) => {
//       console.log("deleted product");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => {
//       console.log("delete product failed" + err);
//     });
// };

// get all products ==> /admin/products

