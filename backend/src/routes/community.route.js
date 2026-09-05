const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const communityController = require('../controllers/community.controller');

const router = express.Router();

router.post('/create', authMiddleware.authMiddleware, communityController.createCommunity);
router.post('/join', authMiddleware.authMiddleware, communityController.joinCommunity);
router.get('/my', authMiddleware.authMiddleware, communityController.getMyCommunities);
router.get('/:communityId', authMiddleware.authMiddleware, communityController.getCommunity);

router.get('/:communityId/announcements',authMiddleware.authMiddleware,communityController.getAnnouncements);
router.post(
    '/:communityId/announcements',
    authMiddleware.authMiddleware,
    communityController.addAnnouncement
);

router.put(
    '/:communityId/announcements/:announcementId',
    authMiddleware.authMiddleware,
    communityController.updateAnnouncement
);


router.delete('/:announcementId', authMiddleware.authMiddleware, communityController.deleteAnnouncement);

router.get(
    '/:communityId/events',
    authMiddleware.authMiddleware,
    communityController.getEvents
);

router.post(
    '/:communityId/events',
    authMiddleware.authMiddleware,
    communityController.addEvent
);

router.put(
    '/:communityId/events/:eventId',
    authMiddleware.authMiddleware,
    communityController.updateEvent
);

router.delete(
    '/:communityId/announcements/:announcementId',
    authMiddleware.authMiddleware,
    communityController.deleteAnnouncement
);

router.get(
    '/:communityId/members',
    authMiddleware.authMiddleware,
    communityController.getMembers
);

router.put(
    '/:communityId/members/:memberId/promote',
    authMiddleware.authMiddleware,
    communityController.promoteMember
);

router.put(
    '/:communityId/members/:memberId/make-owner',
    authMiddleware.authMiddleware,
    communityController.makeOwner
);

router.delete(
    '/:communityId/members/:memberId',
    authMiddleware.authMiddleware,
    communityController.removeMember
);

router.put(
    '/:communityId/members/:memberId/demote',
    authMiddleware.authMiddleware,
    communityController.demoteMember
);

router.get(
    '/:communityId/attendance',
    authMiddleware.authMiddleware,
    communityController.getAttendance
);

router.post(
    '/:communityId/attendance',
    authMiddleware.authMiddleware,
    communityController.takeAttendance
);

router.put(
    '/:communityId/attendance/:attendanceId',
    authMiddleware.authMiddleware,
    communityController.editAttendance
);

/* =========================================
   LEAVE COMMUNITY
========================================= */

router.delete(
    '/:communityId/leave',
    authMiddleware.authMiddleware,
    communityController.leaveCommunity
);

module.exports = router;