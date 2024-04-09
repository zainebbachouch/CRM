const express = require("express");
const userController = require("../controllers/userContoller");
const router = express.Router();
const validateToken = require('../services/validateToken ');

/*
router.post('/loginAdmin', userController.loginAdmin);
router.post('/loginEmploye', userController.loginEmploye);
router.post('/loginClient', userController.loginClient);*/
router.post('/login', userController.loginUser);

router.post('/registerA', userController.registerA);
//router.post('/registerE', userController.registerE);
//router.post('/registerC', userController.registerC);
router.post('/registerC', userController.registerUser);

router.get('/getUserById/:id', userController.getUserById);


module.exports = router;