const express = require("express");
const autorisationController = require("../controllers/autorisationController");
const router = express.Router();

router.get('/addEmployeesToAuthorization', autorisationController.addEmployeesToAuthorization);
router.put('/updatestatusEmployesAutorisation', autorisationController.updatestatusEmployesAutorisation);
module.exports = router;