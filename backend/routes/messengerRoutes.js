const express = require("express");
const messengerController = require("../controllers/messengerController");
const router = express.Router();

router.get('/getNotification', messengerController.getNotifications);
router.put('/updateSeenNotification', messengerController.updateSeenNotification);
router.get('/getUnreadCount', messengerController.getUnreadCount);
router.delete('/deleteNotification/:id', messengerController.deleteNotification);


router.get('/getAllHistoryById', messengerController.getAllHistoryById);

router.get('/history', messengerController.searchHistoryByDate);


router.delete('/deleteHistory/:idAction', messengerController.deleteHistoryById);
// New routes
router.get('/notifications/search', messengerController.searchNotificationsByDate);

module.exports = router;
