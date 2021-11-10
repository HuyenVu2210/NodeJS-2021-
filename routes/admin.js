const express = require('express');
// const path = require('path');
// const rootDir = require('../util/path');

const adminController = require('../controllers/admin')

const router = express.Router();

// router.get('/products', adminController.getProducts);

// router.get('/add-product', adminController.getAddProduct);

// router.post('/add-product', adminController.postAddProduct);

router.get('/', adminController.getStaffDetail);

router.get('/edit-staff', adminController.getEditStaff);

router.post('/edit-staff', adminController.postEditStaff);

// router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
