const express = require("express");
const messengerController = require("../controllers/messengerController");
const router = express.Router();

router.get('/getNotification', messengerController.getNotifications );
router.put('/updateSeenNotification', messengerController.updateSeenNotification );
router.get('/getUnreadCount', messengerController.getUnreadCount );



module.exports = router;
