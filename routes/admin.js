const express = require('express');

const adminController = require('../controllers/admin')

const router = express.Router();

// get - get edit - post edit staff info
router.get('/staff', adminController.getStaffDetail);

router.get('/edit-staff', adminController.getEditStaff);

router.post('/edit-staff', adminController.postEditStaff);

// get - post edit checkin info
router.get('/', adminController.getCheckIn);

router.post('/', adminController.postCheckIn);

// get - post timesheet
router.get('/timesheet', adminController.getTimesheet);
router.post('/timesheet', adminController.postTimesheet);

// get - post covid info
router.get('/vaccine', adminController.getVaccine);

router.post('/vaccine', adminController.postVaccine);

// post day off
router.post('/dayoff', adminController.postDayoff);

// get salary
router.get('/salary/:month', adminController.getSalary);

module.exports = router;
