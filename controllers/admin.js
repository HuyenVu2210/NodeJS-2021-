const Product = require("../models/product");
// const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

// Add product
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const user = req.user;
  user.createProduct({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl
  })
  .then((results) => {
    // console.log(results);
    console.log("product created!");
    res.redirect("/admin/products");
  })
  .catch((err) => {
    console.log(err);
  });
};

// get edit page /admin/edit-product/id
// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;
//   if (!editMode) {
//     return res.redirect("/");
//   }

//   const prodId = req.params.productId;
//   req.user.getProducts({ where: { id: prodId }})
//   // Product.findByPk(prodId)
//     .then((products) => {
//       if (products.length == 0) {
//         return res.redirect("/");
//       }
//       res.render("admin/edit-product", {
//         docTitle: "Edit Product",
//         path: "/admin/edit-product",
//         editing: editMode,
//         product: products[0],
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// // post edit
// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   // console.log(prodId);
//   const updatedTitle = req.body.title;
//   const updatedImageUrl = req.body.imageUrl;
//   const updatedPrice = req.body.price;
//   const updatedDescription = req.body.description;
//   Product.findByPk(prodId)
//     .then((product) => {
//       product.title = updatedTitle;
//       product.imageUrl = updatedImageUrl;
//       product.price = updatedPrice;
//       product.description = updatedDescription;
//       return product.save();
//     })
//     .then((results) => {
//       console.log("edited product");
//       res.redirect("/admin/products");
//       // console.log(results);
//     })
//     .catch((err) => {
//       console.log("post edit failed: " + err);
//     });
// };

// // delete product
// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findByPk(prodId)
//     .then((product) => {
//       return product.destroy();
//     })
//     .then((results) => {
//       console.log("deleted product");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => {
//       console.log("delete product failed" + err);
//     });
// };

// // get all products ==> /admin/products
// exports.getProducts = (req, res, next) => {
//   // Product.findAll()
//   req.user.getProducts()
//     .then((products) => {
//       res.render("admin/products", {
//         prods: products,
//         docTitle: "Admin Products",
//         path: "/admin/products",
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
