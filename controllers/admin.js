const Product = require("../models/product");
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

// get edit page /admin/edit-staff
exports.getEditStaff = (req, res, next) => {
  const Staff = req.staff;
  res.render("admin/edit-staff", {
    staff: Staff,
    docTitle: Staff.name,
    path: "/edit-staff",
  });
};

// post edit
exports.postEditStaff = (req, res, next) => {
  const image = req.body.image;
  const Staff = req.staff;
  Staff.image = image;
  Staff.save()
    .then((results) => {
      console.log("edited staff");
      res.redirect("/admin");
    })
    .catch((err) => {
      console.log("post edit failed: " + err);
    });
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
exports.getStaffDetail = (req, res, next) => {
  const Staff = req.staff;
  res.render("admin/staff-detail", {
    staff: Staff,
    docTitle: Staff.name,
    path: "/",
  });
};
