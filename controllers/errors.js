exports.get404 = (req, res, next) => {
  res.render("404", {
    docTitle: "Page not found",
    path: null,
    isAuthenticated: req.isLoggedIn,
  });
};

exports.get500 = (req, res, next) => {
  res.render("500", {
    docTitle: "Error occurred",
    path: null,
    isAuthenticated: req.isLoggedIn,
  });
};
