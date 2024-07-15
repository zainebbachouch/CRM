const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const multer = require('multer');
const path = require('path');


/*
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../document/uploads/'); // Directory for all images
    },
    filename: (req, file, cb) => {
        const genderPrefix = req.body.genre === 'femme' ? 'female_avatar' : 'male_avatar';
        cb(null, genderPrefix + path.extname(file.originalname)); // Use gender-specific filename
    }
});

const upload = multer({ storage: storage }); upload.single('photo'),*/

router.post('/registerUser', userController.registerUser);



//authentificatin 
router.post('/login', userController.loginUser);
router.post('/registerA', userController.registerA);


router.get('/getUserById/:id', userController.getUserById);

//recupere when role athorized
router.get('/athorizedadmin', userController.listAdminAuthorized);
router.get('/clientbyid/:id', userController.listClientAuthorized);
router.get('/employebyid/:id', userController.listEmployeAuthorized);


//recupere by id 
router.get('/admin/:id', userController.getAdminInformation);
router.get('/client/:id', userController.getClientInformation);
router.get('/employe/:id', userController.getEmployeInformation);


// update by id 
router.put('/updateadmin/:id', userController.updateAdminInformation);
router.put('/updateclient/:id', userController.updateClientInformation);
router.put('/updateemploye/:id', userController.updateEmployeInformation);


//list for adminsration
router.get('/employees', userController.listEmployees);
router.get('/clients', userController.listClients);

//update   for adminsration

router.put('/updateEmployeeStatus/:id', userController.updateEmployeeStatus);
router.put('/updateClientStatus/:id', userController.updateClientStatus);

//delete  for adminsration
router.delete('/employees/:id', userController.deleteEmployee);
router.delete('/deleteClient/:id', userController.deleteClient);



//envoie mail
router.post('/sendMailEmploye', userController.sendMailEmploye)
router.get('/listEmails', userController.listEmails)

module.exports = router;