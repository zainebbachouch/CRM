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
router.post('/registerUser', userController.registerUser);

router.get('/getUserById/:id', userController.getUserById);




router.get('/employees', userController.listEmployees);
router.get('/clients', userController.listClients);

router.put('/updateEmployeeStatus/:id', userController.updateEmployeeStatus);
router.put('/updateClientStatus/:id', userController.updateClientStatus);

router.delete('/employees/:id', userController.deleteEmployee);
router.delete('/deleteClient/:id', userController.deleteClient);
module.exports = router;