const Notification = require('../models/notification.model')

async function getNotifications(req, res) {
    try {
        const notifications =
            await Notification
                .find({
                    user: req.user.userId
                })
                .populate(
                    'community',
                    'name'
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            notifications
        });

    } catch (error) {
        console.error(
            'Get notifications error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to fetch notifications.'
        });
    }
}


/* =========================================
   DELETE / OPEN NOTIFICATION
========================================= */

async function deleteNotification(req, res) {
    try {
        const { notificationId } =
            req.params;

        const notification =
            await Notification.findOneAndDelete({
                _id: notificationId,
                user: req.user.userId
            });

        if (!notification) {
            return res.status(404).json({
                message:
                    'Notification not found.'
            });
        }

        return res.status(200).json({
            message:
                'Notification removed successfully.',

            communityId:
                notification.community
        });

    } catch (error) {
        console.error(
            'Delete notification error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to remove notification.'
        });
    }
}


module.exports = {
    getNotifications,
    deleteNotification
};