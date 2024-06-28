const express = require("express");
const messengerController = require("../controllers/messengerController");
const router = express.Router();

router.get('/getNotification', messengerController.getNotifications );


module.exports = router;
