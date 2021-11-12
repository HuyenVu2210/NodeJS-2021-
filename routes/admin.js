const express = require('express');
// const path = require('path');
// const rootDir = require('../util/path');

const adminController = require('../controllers/admin')

const router = express.Router();

// router.get('/products', adminController.getProducts);

// router.get('/add-product', adminController.getAddProduct);

// router.post('/add-product', adminController.postAddProduct);

// get - get edit - post edit staff info
router.get('/staff', adminController.getStaffDetail);

router.get('/edit-staff', adminController.getEditStaff);

router.post('/edit-staff', adminController.postEditStaff);

// get - post edit checkin info
router.get('/', adminController.getCheckIn);

router.post('/', adminController.postCheckIn);

// get timesheet
router.get('/timesheet', adminController.getTimesheet);

// get - post covid info
router.get('/vaccine', adminController.getVaccine);

router.post('/vaccine', adminController.postVaccine);



// router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
