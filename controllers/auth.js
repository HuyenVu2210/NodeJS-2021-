const Staff = require("../models/staff");

const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash('error');
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0]
  } else {
    errorMessage = null
  };
  res.render("auth/login", {
    path: "/login",
    docTitle: "Login",
    isAuthenticated: false,
    csrfToken: req.csrfToken(),
    errorMessage: errorMessage
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Staff.findOne({ email: email })
    .then((staff) => {
      if (!staff) {
        req.flash('error', 'Invalid email or password');
        return res.redirect("/login");
      }

      bcrypt.compare(password, staff.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.staff = staff;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }

        req.flash('error', 'Invalid email or password');
        return res.redirect('/login')
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};