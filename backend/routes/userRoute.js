const express = require("express");
const userController = require("../controllers/userContoller");
const router = express.Router();
const validateToken= require('../services/validateToken ');



router.post('/login', userController.login);

router.post('/register', userController.register);

router.get('/getUserById/:id',validateToken.isAuthorize, userController.getUserById);


module.exports = router;