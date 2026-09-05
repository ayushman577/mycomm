const express = require('express');

const router = express.Router();

const notificationController =
    require('../controllers/notification.controller');

const authMiddleware =
    require('../middlewares/auth.middleware');


/* =========================================
   GET USER NOTIFICATIONS
========================================= */

router.get(
    '/',
    authMiddleware.authMiddleware,
    notificationController.getNotifications
);


/* =========================================
   DELETE / OPEN NOTIFICATION
========================================= */

router.delete(
    '/:notificationId',
    authMiddleware.authMiddleware,
    notificationController.deleteNotification
);


module.exports = router;