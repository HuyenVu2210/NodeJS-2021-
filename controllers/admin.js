// const Product = require('../models/product');
const Checkin = require('../models/checkin');
const Dayoff = require('../models/dayoff');
const Timesheet = require('../models/timesheet');
const url = require('url'); 
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
  let cannot = req.query.cannot;
  let noTimesheet = req.query.noTimesheet

  console.log(cannot)
  Checkin.find({'staffId': req.staff._id, end: null}).then(checkin => {
    if (checkin.length > 0) {
      isCheckedIn = true;
    }
    res.render('check-in', {
      staff: Staff,
      docTitle: Staff.name,
      path: "/",
      isCheckedIn: isCheckedIn,
      cannot: cannot,
      noTimesheet: noTimesheet
    });
  })
  .catch(err => {
    console.log(err)
  })
};

// post checkin 
exports.postCheckIn = (req, res, next) => {
  Checkin.find({'staffId': req.staff._id, end: null})
  .then(c => {
    if (c.length > 0) {
      let existingCheckin = c[0];
      const checkout_time = new Date;
      existingCheckin.end = checkout_time;
      let hour =
        ((checkout_time.getHours() +
        checkout_time.getMinutes() / 60) -
        (existingCheckin.start.getHours() +
          existingCheckin.start.getMinutes() / 60));
      
      existingCheckin.hour = Math.round(hour*100)/100;

      console.log(typeof hour);
      existingCheckin
        .save()
        .then((results) => {
          console.log("checked in/out");
          Checkin.aggregate(
            [
              { $match: { 'staffId': req.staff._id } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  totalHours: {
                    $sum: "$hour"
                  }
                }
              },
              { $sort: { _id: -1 } }
            ], 
            function(err, results) {
              if (err) {
                console.log(err);
              } else {
                // console.log(results);
                let forRenderTimesheet;
                time = results.map(i => {
                  const date = i._id + 'T00:00:00.000+00:00';
                  const totalHours = i.totalHours;
                  const overTime = totalHours > 8 ? totalHours - 8 : 0;
                  return Checkin.find({'date': date})     // have to return in able to handle as a promise
                  .then(checkin => {
                    return { _id: date, checkin: checkin, totalHours: totalHours, overTime: overTime }
                  });
                });
        
                Promise.all(time).then(function(results) {
                  forRenderTimesheet = results;
                  console.log(JSON.stringify(forRenderTimesheet));
        
                  Timesheet.find({'staffId': req.staff._id})
                  .then(t => {
        
                    // create temporary timesheet to get info
                    const timesheet = new Timesheet({
                      staffId: req.staff._id,
                      timesheet: []
                    });
                    forRenderTimesheet.forEach(i => {
                      timesheet.timesheet.push({
                          _id: i._id,
                          checkin: [...i.checkin],
                          totalHours: i.totalHours,
                          overTime: i.overTime,
                        });
                    }); 
        
                    if (t.length > 0) {
                      let existingTimesheet = t[0];
                      existingTimesheet.timesheet = timesheet.timesheet;
                      existingTimesheet.save().then((results) => {
                        res.redirect("/");
                      });
                    } else {
                      timesheet.save().then((results) => {
                        res.redirect("/");
                      });
                    }
                  })       
                })
              }
            })
        })
        .catch((err) => {
          console.log("post checkin failed: " + err);
        });
    } else {
      let checkin = new Checkin;
      const workplace = req.body.workplace;
      const today = new Date();
      const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      console.log(date);

      checkin.workplace = workplace;
      checkin.start = today;
      checkin.date = date;
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

// get timesheet
exports.getTimesheet = (req, res, next) => {
  Timesheet.find({'staffId': req.staff._id})
  .then(t => {
    if (t.length > 0) {
      const timesheet = t[0];

      let result = timesheet.timesheet.reduce(function (t, a) {
          t[a._id.slice(5,7)] = t[a._id.slice(5,7)] || [];
          t[a._id.slice(5,7)].push(a);
          return t;
        }, Object.create(null));

      // console.log(JSON.stringify(result));


      res.render('timesheet', {
        staff: req.staff,
        docTitle: req.staff.name,
        path: "/timesheet",
        timesheet: timesheet.timesheet,
        months: result
      })
    } else {
      res.redirect(url.format({
        pathname:"/",
        query: {
           noTimesheet: true
         }
      }))
    }
  })
};

// get covid info form
exports.getVaccine = (req, res, next) => {
  const Staff = req.staff;
  res.render('vaccine', {
    staff: Staff,
    docTitle: Staff.name,
    path: "/vaccine",
  });
};

// post covid info 
exports.postVaccine = (req, res, next) => {
    const tem = req.body.tem;
    const shot1 = req.body.shot1;
    const newDate = new Date();
    const newDate1 = newDate.toISOString().slice(0,10) + 'T00:00:00.000+00:00';

    const date1 = req.body.date1 === '' ? newDate1 : req.body.date1;
    const shot2 = req.body.shot2;
    const date2 = req.body.date2 === '' ? newDate1 : req.body.date2;
    const result = req.body.result;

    const v1 = {shot: shot1, date: date1};
    const v2 = {shot: shot2, date: date2};

    req.staff.covid.tem = tem;
    req.staff.covid.result = result;
    req.staff.covid.vaccine[0] = v1;
    req.staff.covid.vaccine[1] = v2;

    req.staff.save()
    .then(results => {
      res.redirect('/')
    })
};

// post dayoff info 
exports.postDayoff = (req, res, next) => {
  const reqdayoff = req.body.dayoff + 'T00:00:00.000+00:00';
  const houroff = Math.round(req.body.houroff*100)/100;

  Dayoff.find({'staffId': req.staff._id, 'date': reqdayoff})
  .then(dayoff => {
    if (dayoff.length > 0) {
      let existingDayoff = dayoff[0];
      let existingHoursOff = existingDayoff.totalHoursOff;
      const totalHoursOff = existingHoursOff + houroff < 8 ? existingHoursOff + houroff: existingHoursOff;
      existingDayoff.totalHoursOff = totalHoursOff;

      const cannot = totalHoursOff !== existingHoursOff + houroff;
      
        existingDayoff.save()
        .then(results => {
          res.redirect(url.format({
            pathname:"/",
            query: {
               cannot: cannot
             }
          }));
        })
    } else {
      const newDayoff = new Dayoff({
        staffId: req.staff._id,
        date: reqdayoff,
        totalHoursOff: houroff
      });
      newDayoff.save()
      .then(results => {
        res.redirect('/');
      })
    }
  })
};


// get salary
exports.getSalary = (req, res, next) => {
  const month = req.params.month;
  console.log(month);
  Timesheet.find({'staffId': req.staff._id})
  .then(t => {
    if (t.length > 0) {
      const timesheet = t[0];

      let result = timesheet.timesheet.reduce(function (t, a) {
        t[a._id.slice(5, 7)] = t[a._id.slice(5, 7)] || [];
        t[a._id.slice(5, 7)].push(a);
        return t;
      }, Object.create(null));

      for (const [key, value] of Object.entries(result)) {
        if (key === month) {
          let overtime = 0;
          // console.log(value)
          value.forEach(v => {
            overtime = overtime + v.overTime;
          })
          console.log(overtime);
          
        }
      }
      // res.render('timesheet', {
      //   staff: req.staff,
      //   docTitle: req.staff.name,
      //   path: "/timesheet",
      //   timesheet: timesheet.timesheet,
      //   months: result
      // })
    } else {
      // res.redirect(url.format({
      //   pathname:"/",
      //   query: {
      //      noTimesheet: true
      //    }
      // }))
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

