const url = require("url");

const Checkin = require("../models/checkin");
const Dayoff = require("../models/dayoff");
const Timesheet = require("../models/timesheet");
const Staff = require("../models/staff");

const fileHelper = require("../util/file");

const fs = require("fs");
const path = require("path");
const pdfDocument = require("pdfkit");

// use moment-business-days to check holiday
// example: moment('01-01-2015', 'DD-MM-YYYY').monthBusinessDays()[0].toDate().toISOString().slice(0,10)
var moment = require("moment-business-days");

var july4th = "2021-07-04";
var laborDay = "2021-05-01";

moment.updateLocale("vn", {
  workingWeekdays: [1, 2, 3, 4, 5],
  holidays: [july4th, laborDay],
  holidayFormat: "YYYY-MM-DD",
});

// show staff info /
exports.getStaffDetail = (req, res, next) => {
  res.render("staff-detail", {
    staff: req.staff,
    docTitle: req.staff.name,
    path: "/staff",
    isManager: req.staff.manager
  });
};

// get edit page /edit-staff
exports.getEditStaff = (req, res, next) => {
  const staffId = req.params.staffId;
  console.log(req.staff.image);

  if (staffId !== req.staff._id.toString()) {
    res.redirect("/");
  }

  Staff.findById(staffId)
    .then((staff) => {
      if (!staff) {
        res.redirect("/");
      }

      res.render("edit-staff", {
        staff: req.staff,
        docTitle: req.staff.name,
        path: "/edit-staff",
        isAuthenticated: req.session.isLoggedIn,
        isManager: req.staff.manager
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// post edit /edit-staff
exports.postEditStaff = (req, res, next) => {
  const image = req.file;
  const staffId = req.body.staffId;

  if (staffId !== req.staff._id.toString()) {
    return res.redirect("/");
  }

  if (image) {
    fileHelper.deleteFile(req.staff.image);
    req.staff.image = image.path;
  }

  req.staff
    .save()
    .then((results) => {
      console.log("edited staff");
      res.redirect("/staff");
      // console.log(results);
    })
    .catch((err) => {
      console.log(err);
    });
};

// get check in
exports.getCheckIn = (req, res, next) => {
  const Staff = req.staff;
  let isCheckedIn = false;
  let cannot = req.query.cannot;
  let noTimesheet = req.query.noTimesheet;
  let overLeave = req.query.overLeave;
  let holiday = req.query.holiday;

  Checkin.find({ staffId: Staff._id, end: null })
    .then((checkin) => {
      let Checkin;
      if (checkin.length > 0) {
        // do not show checkin form if already checked in and not check out yet
        isCheckedIn = true;
        Checkin = checkin[0];
      }
      res.render("check-in", {
        staff: Staff,
        docTitle: "Điểm danh",
        path: "/",
        isCheckedIn: isCheckedIn,
        cannot: cannot,
        noTimesheet: noTimesheet,
        overLeave: overLeave,
        checkin: Checkin,
        holiday: holiday,
        isAuthenticated: req.session.isLoggedIn,
        isManager: req.staff.manager
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// post checkin
exports.postCheckIn = (req, res, next) => {
  Checkin.find({ staffId: req.staff._id, end: null }).then((c) => {
    if (c.length > 0) {
      let existingCheckin = c[0];
      const checkout_time = new Date();
      existingCheckin.end = checkout_time;
      let OT;

      let hour =
        checkout_time.getHours() +
        checkout_time.getMinutes() / 60 -
        (existingCheckin.start.getHours() +
          existingCheckin.start.getMinutes() / 60);

      existingCheckin.hour = Math.round(hour * 100) / 100;

      if (moment(existingCheckin.date.toISOString().slice(0,10), "YYYY-MM-DD").isBusinessDay()) {
        OT = hour > 8 ? hour - 8 : 0;
      } else {
        OT = hour;
      }

      existingCheckin.overTime = OT;

      existingCheckin
        .save()
        .then((results) => {
          Checkin.aggregate(
            [
              { $match: { staffId: req.staff._id } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  totalHours: {
                    $sum: "$hour",
                  },
                },
              },
              { $sort: { _id: -1 } },
            ],
            function (err, results) {
              if (err) {
                console.log(err);
              } else {
                let forRenderTimesheet;
                time = results.map((i) => {
                  const date = i._id + "T00:00:00.000+00:00";
                  let totalHours, overTime;

                  // check whether the date is business day => if business day then all is overTime
                  if (moment(i._id, "YYYY-MM-DD").isBusinessDay()) {
                    totalHours = i.totalHours;
                    overTime = totalHours > 8 ? totalHours - 8 : 0;
                  } else {
                    totalHours = 0;
                    overTime = i.totalHours;
                  }

                  return Checkin.find({ date: date }) // have to return in able to handle as a promise
                    .then((checkin) => {
                      return {
                        _id: date,
                        checkin: checkin,
                        totalHours: totalHours,
                        overTime: overTime,
                      };
                    });
                });

                Promise.all(time).then(function (results) {
                  forRenderTimesheet = results;
                  console.log(results);

                  // find && update timesheet for staff
                  Timesheet.find({ staffId: req.staff._id }).then(
                    (t) => {
                      // create temporary timesheet to get info
                      const timesheet = new Timesheet({
                        staffId: req.staff._id,
                        timesheet: [],
                      });

                      // add checkin info to timesheet
                      forRenderTimesheet.forEach((i) => {
                        let hours =
                          i.totalHours == 0 ? 0 : i.totalHours - i.overTime;
                        timesheet.timesheet.push({
                          _id: i._id,
                          checkin: [...i.checkin],
                          totalHours: i.totalHours,
                          overTime: i.overTime,
                          hours: hours,
                        });
                      });

                      // if already have a timesheet
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
                    }
                  );
                });
              }
            }
          );
        })
        .catch((err) => {
          console.log("post checkin failed: " + err);
        });
    } else {
      let checkin = new Checkin();
      const workplace = req.body.workplace;
      const today = new Date();
      const date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();

      checkin.workplace = workplace;
      checkin.start = today;
      checkin.date = date;
      checkin.staffId = req.staff._id;
      checkin
        .save()
        .then((results) => {
          res.redirect("/");
        })
        .catch((err) => {
          console.log("post checkin failed: " + err);
        });
    }
  });
};

// get timesheet
exports.getTimesheet = (req, res, next) => {
  const ITEMS_PER_PAGE = 2;
  //  console.log(req.staff.manager);

  Staff.findById(req.staff.managerId)
    .then((manager) => {
      let managerName = "";
      if (manager) {
        managerName = manager.name;
      }

      Timesheet.find({ staffId: req.staff._id }).then((t) => {
        if (t.length > 0) {
          const timesheet = t[0];
          const page = +req.query.page || 1;
          const totalCheckins = timesheet.timesheet.length;

          // get the array of months & values
          let result = timesheet.timesheet.reduce(function (t, a) {
            t[a._id.slice(5, 7)] = t[a._id.slice(5, 7)] || [];
            t[a._id.slice(5, 7)].push(a);
            return t;
          }, Object.create(null));

          // sort timesheet by date desc
          timesheet.timesheet.sort(
            (a, b) => (a._id.slice(0, 10) > b._id.slice(0, 10) && -1) || 1
          );

          let PagingTimesheet = timesheet.timesheet.slice(
            (page - 1) * ITEMS_PER_PAGE,
            (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
          );

          res.render("timesheet", {
            staff: req.staff,
            managerName: managerName,
            docTitle: "Tra cứu giờ làm",
            path: "/timesheet",
            timesheet: PagingTimesheet,
            months: result,
            noInfo: false,
            isAuthenticated: req.session.isLoggedIn,
            totalCheckins: totalCheckins,
            currentPage: page,
            hasNextPage: totalCheckins > page * ITEMS_PER_PAGE,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalCheckins / ITEMS_PER_PAGE),
            isManager: req.staff.manager
          });
        } else {
          res.redirect(
            url.format({
              pathname: "/",
              query: {
                noTimesheet: true,
              },
            })
          );
        }
      });
    })
    .catch((err) => {
      next(new Error(err));
    });
};

// post timesheet
exports.postTimesheet = (req, res, next) => {
  const ITEMS_PER_PAGE = req.body.pageNum;

  Staff.findById(req.staff.managerId).then((manager) => {
    let managerName = "";
    if (manager) {
      managerName = manager.name;
    }

    Timesheet.find({ staffId: req.staff._id }).then((t) => {
      if (t.length > 0) {
        const timesheet = t[0];
        const page = +req.query.page || 1;
        const totalCheckins = timesheet.timesheet.length;

        // get the array of months & values
        let result = timesheet.timesheet.reduce(function (t, a) {
          t[a._id.slice(5, 7)] = t[a._id.slice(5, 7)] || [];
          t[a._id.slice(5, 7)].push(a);
          return t;
        }, Object.create(null));

        // sort timesheet by date desc
        timesheet.timesheet.sort(
          (a, b) => (a._id.slice(0, 10) > b._id.slice(0, 10) && -1) || 1
        );

        let PagingTimesheet = timesheet.timesheet.slice(
          (page - 1) * ITEMS_PER_PAGE,
          (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
        );

        res.render("timesheet", {
          staff: req.staff,
          managerName: managerName,
          docTitle: "Tra cứu giờ làm",
          path: "/timesheet",
          timesheet: PagingTimesheet,
          months: result,
          noInfo: false,
          isAuthenticated: req.session.isLoggedIn,
          totalCheckins: totalCheckins,
          currentPage: page,
          hasNextPage: totalCheckins > page * ITEMS_PER_PAGE,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalCheckins / ITEMS_PER_PAGE),
          isManager: req.staff.manager
        });
      } else {
        res.redirect(
          url.format({
            pathname: "/",
            query: {
              noTimesheet: true,
            },
          })
        );
      }
    });
  });
};

// get covid info form
exports.getVaccine = (req, res, next) => {
  const Staff = req.staff;
  res.render("vaccine", {
    staff: Staff,
    docTitle: "Thông tin covid",
    path: "/vaccine",
    isManager: req.staff.manager
  });
};

// post covid info
exports.postVaccine = (req, res, next) => {
  const tem = req.body.tem;
  const shot1 = req.body.shot1;
  const newDate = new Date();
  const newDate1 = newDate.toISOString().slice(0, 10) + "T00:00:00.000+00:00";

  const date1 = req.body.date1 === "" ? newDate1 : req.body.date1;
  const shot2 = req.body.shot2;
  const date2 = req.body.date2 === "" ? newDate1 : req.body.date2;
  const result = req.body.result;

  const v1 = { shot: shot1, date: date1 };
  const v2 = { shot: shot2, date: date2 };

  req.staff.covid.tem = tem;
  req.staff.covid.date = newDate;
  req.staff.covid.result = result;
  req.staff.covid.vaccine[0] = v1;
  req.staff.covid.vaccine[1] = v2;

  req.staff.save().then((results) => {
    res.redirect("/");
  });
};

// post dayoff info
exports.postDayoff = (req, res, next) => {
  const reqdayoff = req.body.dayoff + "T00:00:00.000+00:00";
  const houroff = Math.round(req.body.houroff * 100) / 100;
  const reason = req.body.reason;

  if (req.staff.annualLeave - houroff < 0) {
    res.redirect(
      url.format({
        pathname: "/",
        query: {
          overLeave: true,
        },
      })
    );
  } else if (!moment(reqdayoff, "YYYY-MM-DD").isBusinessDay()) {
    res.redirect(
      url.format({
        pathname: "/",
        query: {
          holiday: true,
        },
      })
    );
  } else {
    // find && update or create if not existing yet
    Dayoff.find({ staffId: req.staff._id, date: reqdayoff }).then((dayoff) => {
      if (dayoff.length > 0) {
        let existingDayoff = dayoff[0];
        let existingHoursOff = existingDayoff.totalHoursOff;
        let totalHoursOff =
          existingHoursOff + houroff < 8
            ? existingHoursOff + houroff
            : existingHoursOff;

        existingDayoff.totalHoursOff = totalHoursOff;
        existingDayoff.reason = reason === "" ? "" : reason;

        const cannot = totalHoursOff !== existingHoursOff + houroff;

        existingDayoff.save().then((results) => {
          req.staff.annualLeave =
            totalHoursOff !== existingHoursOff + houroff
              ? req.staff.annualLeave
              : req.staff.annualLeave - totalHoursOff;

          req.staff.save().then((results) => {
            res.redirect(
              url.format({
                pathname: "/",
                query: {
                  cannot: cannot,
                },
              })
            );
          });
        });
      } else {
        let month = reqdayoff.slice(5, 7);

        if (houroff < 8) {
          const newDayoff = new Dayoff({
            staffId: req.staff._id,
            date: reqdayoff,
            month: month,
            totalHoursOff: houroff,
            reason: reason === "" ? "" : reason,
          });
          newDayoff.save().then((results) => {
            req.staff.annualLeave = req.staff.annualLeave - houroff;
            req.staff.save().then((results) => {
              res.redirect("/");
            });
          });
        } else {
          res.redirect(
            url.format({
              pathname: "/",
              query: {
                cannot: true,
              },
            })
          );
        }
      }
    });
  }
};

// get salary
exports.getSalary = (req, res, next) => {
  const month = req.params.month;
  Timesheet.find({ staffId: req.staff._id }).then((t) => {
    if (t.length > 0) {
      const timesheet = t[0];

      let result = timesheet.timesheet.reduce(function (t, a) {
        t[a._id.slice(5, 7)] = t[a._id.slice(5, 7)] || [];
        t[a._id.slice(5, 7)].push(a);
        return t;
      }, Object.create(null));

      // find the value of the selected month
      const found = Object.entries(result).find(
        ([key, value]) => key === month
      );
      if (found) {
        let overtime = 0;
        let workingDays = [];
        let businessDay;

        // get the array of business day
        businessDay = moment("2021-" + month + "-01", "YYYY-MM-DD")
          .monthBusinessDays()
          // .slice(1)
          .map((m) => {
            return m.toString().slice(0, 10);
          });

        // find the total overtime
        found[1].forEach((v) => {
          overtime = overtime + v.overTime;
        });

        found[1].forEach((v) => {
          // get array of working days in month
          let date = v._id.slice(0, 10);
          let hours = v.hours;
          workingDays.push({
            date: date,
            hours: hours,
          });
        });

        // find the array of dayoff
        Dayoff.find({ month: month }).then((d) => {
          // create sum for undertime
          let underTime = 0;
          console.log(businessDay.length);
          businessDay.forEach((bd) => {
            underTime = underTime + 8;
            workingDays.forEach((wd) => {
              if (wd.date === bd) {
                underTime = underTime - wd.hours;
                d.forEach((dd) => {
                  if (dd.date.toISOString().slice(0, 10) === bd) {
                    underTime = underTime + dd.totalHoursOff;
                  }
                });
              }
            });
          });

          res.render("salary", {
            staff: req.staff,
            docTitle: "Lương tháng " + month,
            path: "/salary",
            underTime: Math.round(underTime * 100) / 100,
            overTime: overtime,
            month: month,
            isAuthenticated: req.session.isLoggedIn,
            isManager: req.staff.manager
          });
        });
      } else {
        // if there is no timesheet info for that month
        res.redirect(
          url.format({
            pathname: "/",
            query: {
              noTimesheet: true,
            },
          })
        );
      }
    } else {
      res.redirect(
        url.format({
          pathname: "/",
          query: {
            noTimesheet: true,
          },
        })
      );
    }
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////
// get employee list
exports.getEmployeeTimesheet = (req, res, next) => {
  Staff.find(
    {
      _id: { $in: req.staff.employee },
    },
    function (err, docs) {
      res.render("employeeTimesheet", {
        staff: req.staff,
        docTitle: "Tra giờ của nhân viên",
        path: "/employeeTimesheet",
        employees: docs,
        isAuthenticated: req.session.isLoggedIn,
        isManager: req.staff.manager
      });
    }
  );
};

exports.getEmployeeTimesheetWithId = (req, res, next) => {
  const ITEMS_PER_PAGE = 2;
  const employeeId = req.params.employeeId;
  let managerName = req.staff.name;

  Staff.findById(employeeId) 
  .then(employee => {
    let e = employee
    Timesheet.find({ staffId: employeeId }).then((t) => {
      if (t.length > 0) {
        const timesheet = t[0];
        const page = +req.query.page || 1;
        const totalCheckins = timesheet.timesheet.length;

        // get the array of months & values
        let result = timesheet.timesheet.reduce(function (t, a) {
          t[a._id.slice(5, 7)] = t[a._id.slice(5, 7)] || [];
          t[a._id.slice(5, 7)].push(a);
          return t;
        }, Object.create(null));

        // sort timesheet by date desc
        timesheet.timesheet.sort(
          (a, b) => (a._id.slice(0, 10) > b._id.slice(0, 10) && -1) || 1
        );

        let PagingTimesheet = timesheet.timesheet.slice(
          (page - 1) * ITEMS_PER_PAGE,
          (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
        );

        res.render("timesheet-employeeId", {
          staff: e,
          managerName: managerName,
          docTitle: "Tra cứu giờ làm",
          path: "/employeeTimmsheet",
          timesheet: PagingTimesheet,
          months: result,
          noInfo: false,
          isAuthenticated: req.session.isLoggedIn,
          totalCheckins: totalCheckins,
          currentPage: page,
          hasNextPage: totalCheckins > page * ITEMS_PER_PAGE,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalCheckins / ITEMS_PER_PAGE),
          isManager: req.staff.manager
        });
      } else {
        res.redirect(
          url.format({
            pathname: "/",
            query: {
              noTimesheet: true,
            },
          })
        );
      }
    })
  })
      
    .catch((err) => {
      next(new Error(err));
    });
};


// delete checkin 
exports.postDeleteCheckin = (req, res, next) => {
  const checkinId = req.body.checkinId;
  const employeeId = req.body.employeeId;

  Checkin.findById(checkinId)
  .then(checkin => {
    Timesheet.find({ staffId: employeeId })
    .then(t => {
      let timesheet = t[0];
      let index1;
      let index2;

      timesheet.timesheet.forEach((i, indexA) => {
        i.checkin.forEach((c, indexB) => {
          if (c._id.toString() === checkinId.toString()) {
            index1 = indexA;
            index2 = indexB;
          }
        })
      })

      console.log(index1, index2);
      console.log(timesheet.timesheet[index1].totalHours);


      timesheet.timesheet[index1].checkin.splice(index2, 1);
      if (timesheet.timesheet[index1].totalHours - checkin.hour < 0) {
        timesheet.timesheet.splice(index1, 1)
      } else {
        timesheet.timesheet[index1].totalHours = timesheet.timesheet[index1].totalHours - checkin.hour;
      // timesheet.timesheet[index1].overTime = timesheet.timesheet[index1].overTime - checkin.overTime;
      }

      timesheet.save()
      .then(results => {
        Checkin.findByIdAndDelete(checkinId)
        .then(results => {
          res.redirect('/employeeTimesheet')
        })
      })
    })
  })
  .catch(err => {
    next(new Error(err))
  })
};

// get employee list
exports.getEmployeeVaccine = (req, res, next) => {
  Staff.find(
    {
      _id: { $in: req.staff.employee },
    },
    function (err, docs) {
      res.render("employeeVaccine", {
        staff: req.staff,
        docTitle: "Thông tin covid của nhân viên",
        path: "/employeeVaccine",
        employees: docs,
        isAuthenticated: req.session.isLoggedIn,
        isManager: req.staff.manager
      });
    }
  );
};

exports.getEmployeeVaccineWithId = (req, res, next) => {
  const employeeId = req.params.employeeId;
  Staff.findById(employeeId)
  .then(employee => {
    if (!employee) {
      return res.redirect('/')
    }

    if (employee.managerId.toString() !== req.staff._id.toString()) {
      return res.redirect('/')
    } 

    res.render("employeeVaccineWithId", {
      staff: employee,
      docTitle: "Thông tin covid của nhân viên",
      path: "/employeeVaccine",
      isManager: req.staff.manager
    });
  })
  .catch(err => {
    next(new Error(err))
  })
};

exports.getVaccinePdf = (req, res, next) => {
  const employeeId = req.params.employeeId;

  Staff.findById(employeeId)
    .then((staff) => {
      if (!staff) {
        return next(new Error("No staff"));
      }
      if (staff.managerId.toString() !== req.staff._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const pdfName = "VaccineInfo-" + staff.name + ".pdf";
      const pdfPath = path.join("data", "pdf", pdfName);

      
      const pdfDoc = new pdfDocument();

      pdfDoc.font('public/font/VAVOB.TTF');

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + pdfName + '"'
      );

      const result = staff.covid.result ? staff.covid.result : 'N/a';
      const tem = staff.covid.tem ? staff.covid.tem : 'N/a';
      const vaccine1 = staff.covid.vaccine[0] ? staff.covid.vaccine[0]['shot'] : 'N/a';
      const date1 = staff.covid.vaccine[0] ? staff.covid.vaccine[0]['date'].toISOString().slice(0,10) : 'N/a';
      const vaccine2 = staff.covid.vaccine[1] ? staff.covid.vaccine[1]['shot'] : 'N/a';
      const date2 = staff.covid.vaccine[1] ? staff.covid.vaccine[1]['date'].toISOString().slice(0,10) : 'N/a';

      pdfDoc.pipe(fs.createWriteStream(pdfPath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(24).text("Thông tin vaccine", {
        underline: true,
      });
      pdfDoc.text("----------------------");

      pdfDoc.fontSize(18).text('Kết quả xét nghiệm: ' + result);
      pdfDoc.fontSize(18).text('Nhiệt độ: ' + tem);
      pdfDoc.fontSize(18).text('Loại vaccine mũi 1: ' + vaccine1);
      pdfDoc.fontSize(18).text('Ngày tiêm mũi 1: ' + date1);
      pdfDoc.fontSize(18).text('Loại vaccine mũi 2: ' + vaccine2);
      pdfDoc.fontSize(18).text('Ngày tiêm mũi 2: ' + date2);

      pdfDoc.text("-------");

      pdfDoc.end();
    })
    .catch((err) => {
      return next(err);
    });
};