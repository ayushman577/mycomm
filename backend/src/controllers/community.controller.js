const communityModel = require('../models/community.model');
const Notification = require('../models/notification.model');
const {
    sendAnnouncementEmail
} = require('../utils/email.service');

async function getMyCommunities(req, res) {
    try {
        const userId = req.user.userId.toString();

        const communities = await communityModel.find({
            'members.user': userId
        });

        const formattedCommunities = communities.map(
            (community) => {
                const currentMember =
                    community.members.find(
                        (member) =>
                            member.user &&
                            member.user.toString() === userId
                    );

                return {
                    _id: community._id,
                    name: community.name,
                    description: community.description,
                    communityCode: community.communityCode,

                    role:
                        currentMember?.role ||
                        'member'
                };
            }
        );

        return res.status(200).json({
            message:
                'My communities retrieved successfully',
            communities: formattedCommunities
        });

    } catch (error) {
        console.error(
            'Error retrieving my communities:',
            error
        );

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function generateCommunityCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    while (true) {
        let code = '';

        for (let i = 0; i < 6; i++) {
            code += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        const existingCommunity = await communityModel.findOne({
            communityCode: code
        });

        if (!existingCommunity) {
            return code;
        }
    }
}

async function createCommunity(req, res) {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Community name is required'
            });
        }

        const communityCode = await generateCommunityCode();

        const community = new communityModel({
            communityCode: communityCode,
            name: name.trim(),
            description: description?.trim() || '',
            createdBy: req.user.userId,

            members: [
                {
                    user: req.user.userId,
                    role: 'owner'
                }
            ]
        });

        await community.save();

        res.status(201).json({
            message: 'Community created successfully',
            community

        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }

}

async function joinCommunity(req, res) {
    try {
        const { communityCode } = req.body;
        if (!communityCode) {
            return res.status(400).json({
                message: 'Community code is required'
            });
        }

        const community = await communityModel.findOne({
            communityCode: communityCode.toUpperCase()
        });

        if (!community) {
            return res.status(404).json({
                message: 'Community not found'
            });
        }

        const alreadyMember = community.members.some(
            member => member.user.toString() === req.user.userId
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: 'You are already a member of this community'
            });
        }

        community.members.push({
            user: req.user.userId,
            role: 'member'
        });

        await community.save();

        res.status(200).json({
            message: 'Joined community successfully',
            community
        });

    } catch (error) {
        console.error('Error joining community:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const getCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;

        const community = await communityModel
            .findById(communityId)
            .populate('createdBy', 'username email')
            .populate('members.user', 'username email');

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find((item) => {
            if (!item.user) return false;

            return item.user._id.toString() === currentUserId;
        });

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        return res.status(200).json({
            community,
            role: member.role
        });

    } catch (error) {
        console.error('Get community error:', error);

        return res.status(500).json({
            message: 'Failed to get community.'
        });
    }
};

async function getAnnouncements(req, res) {
    try {
        const { communityId } = req.params;

        const community = await communityModel.findById(communityId)
            .populate('announcements.createdBy', 'username');

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        return res.status(200).json({
            announcements: community.announcements
        });

    } catch (error) {
        console.error('Get announcements error:', error);

        return res.status(500).json({
            message: 'Failed to get announcements.'
        });
    }
}

async function addAnnouncement(req, res) {
    try {
        const { communityId } = req.params;
        const { title, message } = req.body;

        if (!title?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: 'Title and message are required.'
            });
        }

        const community = await communityModel
            .findById(communityId)
            .populate(
                'members.user',
                'name username email'
            );

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId =
            req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user._id.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message:
                    'You are not a member of this community.'
            });
        }

        if (
            member.role !== 'admin' &&
            member.role !== 'owner'
        ) {
            return res.status(403).json({
                message:
                    'Only admins and owners can add announcements.'
            });
        }

        community.announcements.push({
            title: title.trim(),
            message: message.trim(),
            createdBy: req.user.userId
        });

        await community.save();

        const newAnnouncement =
            community.announcements[
                community.announcements.length - 1
            ];

        // All members except the person who created it
        const otherMembers = community.members.filter(
            (item) =>
                item.user &&
                item.user._id.toString() !== currentUserId
        );

        // Create in-app notifications
        const notifications = otherMembers.map(
            (item) => ({
                user: item.user._id,
                community: community._id,
                type: 'announcement',
                title: title.trim(),
                message: message.trim()
            })
        );

        if (notifications.length > 0) {
            await Notification.insertMany(
                notifications
            );
        }

        // Send email notifications
        await Promise.all(
            otherMembers
                .filter(
                    (item) =>
                        item.user.email
                )
                .map((item) =>
                    sendAnnouncementEmail(
                        item.user.email,
                        community.name,
                        title.trim(),
                        message.trim()
                    )
                )
        );

        return res.status(201).json({
            message:
                'Announcement added successfully.',
            announcement: newAnnouncement
        });

    } catch (error) {
        console.error(
            'Add announcement error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to add announcement.'
        });
    }
}

async function updateAnnouncement(req, res) {
    try {
        const { communityId, announcementId } = req.params;
        const { title, message } = req.body;

        if (!title?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: 'Title and message are required.'
            });
        }

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        if (member.role !== 'admin' && member.role !== 'owner') {
            return res.status(403).json({
                message: 'Only admins and owners can edit announcements.'
            });
        }

        const announcement =
            community.announcements.id(announcementId);

        if (!announcement) {
            return res.status(404).json({
                message: 'Announcement not found.'
            });
        }

        announcement.title = title.trim();
        announcement.message = message.trim();
        announcement.updatedAt = new Date();

        await community.save();

        return res.status(200).json({
            message: 'Announcement updated successfully.',
            announcement
        });

    } catch (error) {
        console.error('Update announcement error:', error);

        return res.status(500).json({
            message: 'Failed to update announcement.'
        });
    }
}

const deleteAnnouncement = async (req, res) => {
    try {
        const { communityId, announcementId } = req.params;

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const announcement = community.announcements.id(announcementId);

        if (!announcement) {
            return res.status(404).json({
                message: 'Announcement not found.'
            });
        }

        announcement.deleteOne();

        await community.save();

        res.status(200).json({
            message: 'Announcement deleted successfully.'
        });

    } catch (error) {
        console.error('Delete announcement error:', error);

        res.status(500).json({
            message: 'Failed to delete announcement.'
        });
    }
};

async function getEvents(req, res) {
    try {
        const { communityId } = req.params;

        const community = await communityModel
            .findById(communityId)
            .populate('events.createdBy', 'username');

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        return res.status(200).json({
            events: community.events
        });

    } catch (error) {
        console.error('Get events error:', error);

        return res.status(500).json({
            message: 'Failed to get events.'
        });
    }
}

async function addEvent(req, res) {
    try {
        const { communityId } = req.params;
        const { name, place, date, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: 'Event name is required.'
            });
        }

        if (!place?.trim()) {
            return res.status(400).json({
                message: 'Event place is required.'
            });
        }

        if (!date) {
            return res.status(400).json({
                message: 'Event date is required.'
            });
        }

        const eventDate = new Date(date);

        if (Number.isNaN(eventDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid event date.'
            });
        }

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        if (member.role !== 'admin' && member.role !== 'owner') {
            return res.status(403).json({
                message: 'Only admins and owners can add events.'
            });
        }

        community.events.push({
            name: name.trim(),
            place: place.trim(),
            date: eventDate,
            description: description?.trim() || '',
            createdBy: req.user.userId
        });

        await community.save();

        const newEvent =
            community.events[
            community.events.length - 1
            ];

        return res.status(201).json({
            message: 'Event added successfully.',
            event: newEvent
        });

    } catch (error) {
        console.error('Add event error:', error);

        return res.status(500).json({
            message: 'Failed to add event.'
        });
    }
}

async function updateEvent(req, res) {
    try {
        const { communityId, eventId } = req.params;
        const { name, place, date, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: 'Event name is required.'
            });
        }

        if (!place?.trim()) {
            return res.status(400).json({
                message: 'Event place is required.'
            });
        }

        if (!date) {
            return res.status(400).json({
                message: 'Event date is required.'
            });
        }

        const eventDate = new Date(date);

        if (Number.isNaN(eventDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid event date.'
            });
        }

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        if (member.role !== 'admin' && member.role !== 'owner') {
            return res.status(403).json({
                message: 'Only admins and owners can edit events.'
            });
        }

        const event = community.events.id(eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found.'
            });
        }

        event.name = name.trim();
        event.place = place.trim();
        event.date = eventDate;
        event.description = description?.trim() || '';
        event.updatedAt = new Date();

        await community.save();

        return res.status(200).json({
            message: 'Event updated successfully.',
            event
        });

    } catch (error) {
        console.error('Update event error:', error);

        return res.status(500).json({
            message: 'Failed to update event.'
        });
    }
}

async function deleteEvent(req, res) {
    try {
        const { communityId, eventId } = req.params;

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const member = community.members.find(
            (item) =>
                item.user &&
                item.user.toString() === currentUserId
        );

        if (!member) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        if (member.role !== 'admin' && member.role !== 'owner') {
            return res.status(403).json({
                message: 'Only admins and owners can delete events.'
            });
        }

        const event = community.events.id(eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found.'
            });
        }

        community.events.pull(eventId);

        await community.save();

        return res.status(200).json({
            message: 'Event deleted successfully.'
        });

    } catch (error) {
        console.error('Delete event error:', error);

        return res.status(500).json({
            message: 'Failed to delete event.'
        });
    }
}

async function getMembers(req, res) {
    try {
        const { communityId } = req.params;

        const community = await communityModel
            .findById(communityId)
            .populate('members.user', 'name username email');

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const currentMember = community.members.find(
            (member) =>
                member.user &&
                member.user._id.toString() === currentUserId
        );

        if (!currentMember) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        const members = [...community.members]
            .sort(
                (a, b) =>
                    new Date(a.joinedAt).getTime() -
                    new Date(b.joinedAt).getTime()
            )
            .map((member) => ({
                _id: member._id,
                user: member.user,
                role: member.role,
                joinedAt: member.joinedAt
            }));

        return res.status(200).json({
            members,
            currentUserRole: currentMember.role
        });

    } catch (error) {
        console.error('Get members error:', error);

        return res.status(500).json({
            message: 'Failed to fetch members.'
        });
    }
}

async function promoteMember(req, res) {
    try {
        const { communityId, memberId } = req.params;

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const currentMember = community.members.find(
            (member) =>
                member.user &&
                member.user.toString() === currentUserId
        );

        if (!currentMember) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        const targetMember = community.members.id(memberId);

        if (!targetMember) {
            return res.status(404).json({
                message: 'Member not found.'
            });
        }

        if (targetMember.user.toString() === currentUserId) {
            return res.status(400).json({
                message: 'You cannot promote yourself.'
            });
        }

        // Owner can promote members to admin
        if (currentMember.role === 'owner') {
            if (targetMember.role === 'member') {
                targetMember.role = 'admin';
            } else {
                return res.status(400).json({
                    message: 'Only members can be promoted to admin.'
                });
            }
        }

        // Admin can promote members to admin
        else if (currentMember.role === 'admin') {
            if (targetMember.role === 'member') {
                targetMember.role = 'admin';
            } else {
                return res.status(403).json({
                    message: 'Admins can only promote members.'
                });
            }
        }

        else {
            return res.status(403).json({
                message: 'Only admins and owners can promote members.'
            });
        }

        await community.save();

        return res.status(200).json({
            message: 'Member promoted to admin successfully.',
            role: targetMember.role
        });

    } catch (error) {
        console.error('Promote member error:', error);

        return res.status(500).json({
            message: 'Failed to promote member.'
        });
    }
}

async function makeOwner(req, res) {
    try {
        const { communityId, memberId } = req.params;

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const currentMember = community.members.find(
            (member) =>
                member.user &&
                member.user.toString() === currentUserId
        );

        if (!currentMember) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        if (currentMember.role !== 'owner') {
            return res.status(403).json({
                message: 'Only the owner can transfer ownership.'
            });
        }

        const targetMember = community.members.id(memberId);

        if (!targetMember) {
            return res.status(404).json({
                message: 'Member not found.'
            });
        }

        if (targetMember.user.toString() === currentUserId) {
            return res.status(400).json({
                message: 'You are already the owner.'
            });
        }

        // New owner
        targetMember.role = 'owner';

        // Previous owner becomes admin
        currentMember.role = 'admin';

        await community.save();

        return res.status(200).json({
            message: 'Ownership transferred successfully.'
        });

    } catch (error) {
        console.error('Make owner error:', error);

        return res.status(500).json({
            message: 'Failed to transfer ownership.'
        });
    }
}

async function removeMember(req, res) {
    try {
        const { communityId, memberId } = req.params;

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const currentMember = community.members.find(
            (member) =>
                member.user &&
                member.user.toString() === currentUserId
        );

        if (!currentMember) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        // Only owner can remove members
        if (currentMember.role !== 'owner') {
            return res.status(403).json({
                message: 'Only the owner can remove members.'
            });
        }

        const targetMember = community.members.id(memberId);

        if (!targetMember) {
            return res.status(404).json({
                message: 'Member not found.'
            });
        }

        // Owner cannot remove himself
        if (targetMember.user.toString() === currentUserId) {
            return res.status(400).json({
                message: 'You cannot remove yourself.'
            });
        }

        // Safety check
        if (targetMember.role === 'owner') {
            return res.status(400).json({
                message: 'The owner cannot be removed.'
            });
        }

        community.members.pull(memberId);

        await community.save();

        return res.status(200).json({
            message: 'Member removed successfully.'
        });

    } catch (error) {
        console.error('Remove member error:', error);

        return res.status(500).json({
            message: 'Failed to remove member.'
        });
    }
}

async function demoteMember(req, res) {
    try {
        const { communityId, memberId } = req.params;

        const community = await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId = req.user.userId.toString();

        const currentMember = community.members.find(
            (member) =>
                member.user &&
                member.user.toString() === currentUserId
        );

        if (!currentMember) {
            return res.status(403).json({
                message: 'You are not a member of this community.'
            });
        }

        // Only owner can demote admins
        if (currentMember.role !== 'owner') {
            return res.status(403).json({
                message: 'Only the owner can demote admins.'
            });
        }

        const targetMember = community.members.id(memberId);

        if (!targetMember) {
            return res.status(404).json({
                message: 'Member not found.'
            });
        }

        // Owner cannot demote himself
        if (
            targetMember.user.toString() ===
            currentUserId
        ) {
            return res.status(400).json({
                message: 'You cannot demote yourself.'
            });
        }

        // Only admins can be demoted
        if (targetMember.role !== 'admin') {
            return res.status(400).json({
                message: 'Only admins can be demoted.'
            });
        }

        targetMember.role = 'member';

        await community.save();

        return res.status(200).json({
            message: 'Admin demoted to member successfully.',
            role: targetMember.role
        });

    } catch (error) {
        console.error('Demote member error:', error);

        return res.status(500).json({
            message: 'Failed to demote member.'
        });
    }
}

/* =========================================
   ATTENDANCE
========================================= */

async function getAttendance(req, res) {
    try {
        const { communityId } = req.params;
        const {
            type,
            year,
            month,
            date
        } = req.query;

        const community =
            await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId =
            req.user.userId.toString();

        const currentMember =
            community.members.find(
                (member) =>
                    member.user &&
                    member.user.toString() ===
                        currentUserId
            );

        if (!currentMember) {
            return res.status(403).json({
                message:
                    'You are not a member of this community.'
            });
        }

        const role = currentMember.role;

        const isManager =
            role === 'owner' ||
            role === 'admin';

        let filteredAttendance = [];

        /* =========================================
           MANAGER VIEW
           Return ALL attendance for selected day
        ========================================= */

        if (isManager) {
            if (!date) {
                return res.status(400).json({
                    message:
                        'Attendance date is required.'
                });
            }

            const [
                selectedYear,
                selectedMonth,
                selectedDay
            ] = date.split('-').map(Number);

            if (
                !selectedYear ||
                !selectedMonth ||
                !selectedDay
            ) {
                return res.status(400).json({
                    message:
                        'Invalid attendance date.'
                });
            }

            filteredAttendance =
                community.attendance.filter(
                    (record) => {
                        if (!record.date) {
                            return false;
                        }

                        const recordDate =
                            new Date(record.date);

                        return (
                            recordDate.getUTCFullYear() ===
                                selectedYear &&
                            recordDate.getUTCMonth() + 1 ===
                                selectedMonth &&
                            recordDate.getUTCDate() ===
                                selectedDay
                        );
                    }
                );
        }

        /* =========================================
           MEMBER VIEW
           Return ONLY current user's records
           for selected month/year
        ========================================= */

        else {
            if (!year || !month) {
                return res.status(400).json({
                    message:
                        'Year and month are required.'
                });
            }

            const selectedYear =
                Number(year);

            const selectedMonth =
                Number(month);

            filteredAttendance =
                community.attendance.filter(
                    (record) => {
                        if (!record.date) {
                            return false;
                        }

                        if (!record.member) {
                            return false;
                        }

                        const memberId =
                            record.member.toString();

                        if (
                            memberId !==
                            currentUserId
                        ) {
                            return false;
                        }

                        const recordDate =
                            new Date(record.date);

                        return (
                            recordDate.getUTCFullYear() ===
                                selectedYear &&
                            recordDate.getUTCMonth() + 1 ===
                                selectedMonth
                        );
                    }
                );
        }
        console.log(
    'FILTERED ATTENDANCE:',
    filteredAttendance.map(record => ({
        member: record.member?.toString(),
        date: record.date,
        status: record.status
    }))
);

        return res.status(200).json({
            attendance:
                filteredAttendance,
            currentUserRole: role
        });

    } catch (error) {
        console.error(
            'Get attendance error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to retrieve attendance.'
        });
    }
}

async function takeAttendance(req, res) {
    try {
        const { communityId } = req.params;
        const { date, attendance } = req.body;

        if (!date) {
            return res.status(400).json({
                message: 'Attendance date is required.'
            });
        }

        if (!Array.isArray(attendance)) {
            return res.status(400).json({
                message: 'Attendance data must be an array.'
            });
        }

        if (attendance.length === 0) {
            return res.status(400).json({
                message: 'No attendance records were submitted.'
            });
        }

        const community =
            await communityModel.findById(communityId);

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId =
            req.user.userId.toString();

        const currentMember =
            community.members.find(
                (member) =>
                    member.user &&
                    member.user.toString() ===
                        currentUserId
            );

        if (!currentMember) {
            return res.status(403).json({
                message:
                    'You are not a member of this community.'
            });
        }

        if (
            currentMember.role !== 'owner' &&
            currentMember.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'Only admins and owners can take attendance.'
            });
        }

        /* =========================================
           DATE
        ========================================= */

        const [year, month, day] =
            date.split('-').map(Number);

        if (
            !year ||
            !month ||
            !day
        ) {
            return res.status(400).json({
                message: 'Invalid attendance date.'
            });
        }

        /*
         * Store attendance date as UTC midnight
         * so the calendar date remains consistent.
         */
        const attendanceDate =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day
                )
            );

        /* =========================================
           PROCESS EVERY SUBMITTED MEMBER
        ========================================= */

        for (const entry of attendance) {
            const {
                memberId,
                status
            } = entry;

            if (!memberId) {
                console.log(
                    'Skipping entry without memberId:',
                    entry
                );
                continue;
            }

            if (
                status !== 'present' &&
                status !== 'absent'
            ) {
                return res.status(400).json({
                    message:
                        `Invalid attendance status for member ${memberId}.`
                });
            }

            /*
             * IMPORTANT:
             * memberId from frontend is the USER ID,
             * not the members[] subdocument ID.
             */
            const targetMember =
                community.members.find(
                    (member) =>
                        member.user &&
                        member.user.toString() ===
                            memberId.toString()
                );

            if (!targetMember) {
                console.log(
                    'Member not found:',
                    memberId
                );

                return res.status(400).json({
                    message:
                        `Member ${memberId} is not part of this community.`
                });
            }

            /* =========================================
               DO NOT ALLOW HISTORICAL ATTENDANCE BEFORE
               THE MEMBER JOINED
            ========================================= */

            if (targetMember.joinedAt) {
                const joinedAt =
                    new Date(
                        targetMember.joinedAt
                    );

                const joinedYear =
                    joinedAt.getUTCFullYear();

                const joinedMonth =
                    joinedAt.getUTCMonth();

                const joinedDay =
                    joinedAt.getUTCDate();

                const joinedDate =
                    new Date(
                        Date.UTC(
                            joinedYear,
                            joinedMonth,
                            joinedDay
                        )
                    );

                if (
                    joinedDate.getTime() >
                    attendanceDate.getTime()
                ) {
                    console.log(
                        'Skipping member who had not joined yet:',
                        memberId
                    );

                    continue;
                }
            }

            /* =========================================
               FIND EXISTING ATTENDANCE
            ========================================= */

            const existingAttendance =
                community.attendance.find(
                    (record) => {
                        if (!record.member) {
                            return false;
                        }

                        if (
                            record.member.toString() !==
                            memberId.toString()
                        ) {
                            return false;
                        }

                        if (!record.date) {
                            return false;
                        }

                        const recordDate =
                            new Date(
                                record.date
                            );

                        /*
                         * Compare calendar date
                         * using UTC.
                         */
                        return (
                            recordDate.getUTCFullYear() ===
                                year &&
                            recordDate.getUTCMonth() + 1 ===
                                month &&
                            recordDate.getUTCDate() ===
                                day
                        );
                    }
                );

            /* =========================================
               UPDATE EXISTING RECORD
            ========================================= */

            if (existingAttendance) {
                existingAttendance.status =
                    status;

                existingAttendance.markedBy =
                    req.user.userId;

                existingAttendance.updatedAt =
                    new Date();

                console.log(
                    'Updated attendance:',
                    memberId,
                    status,
                    date
                );
            }

            /* =========================================
               CREATE NEW RECORD
            ========================================= */

            else {
                community.attendance.push({
                    member: targetMember.user,
                    date: attendanceDate,
                    status,
                    markedBy: req.user.userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                console.log(
                    'Created attendance:',
                    memberId,
                    status,
                    date
                );
            }
        }

        await community.save();

        /* =========================================
           RETURN ONLY THE SELECTED DAY
        ========================================= */

        const savedAttendance =
            community.attendance.filter(
                (record) => {
                    if (!record.date) {
                        return false;
                    }

                    const recordDate =
                        new Date(
                            record.date
                        );

                    return (
                        recordDate.getUTCFullYear() ===
                            year &&
                        recordDate.getUTCMonth() + 1 ===
                            month &&
                        recordDate.getUTCDate() ===
                            day
                    );
                }
            );

        return res.status(200).json({
            message:
                'Attendance saved successfully.',
            attendance:
                savedAttendance
        });

    } catch (error) {
        console.error(
            'Take attendance error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to save attendance.'
        });
    }
}

async function editAttendance(req, res) {
    try {
        const {
            communityId,
            attendanceId
        } = req.params;

        const { status } = req.body;

        if (
            status !== 'present' &&
            status !== 'absent'
        ) {
            return res.status(400).json({
                message:
                    'Attendance status must be present or absent.'
            });
        }

        const community =
            await communityModel.findById(
                communityId
            );

        if (!community) {
            return res.status(404).json({
                message:
                    'Community not found.'
            });
        }

        const currentUserId =
            req.user.userId.toString();

        const currentMember =
            community.members.find(
                (member) =>
                    member.user &&
                    member.user.toString() ===
                    currentUserId
            );

        if (!currentMember) {
            return res.status(403).json({
                message:
                    'You are not a member of this community.'
            });
        }

        if (
            currentMember.role !== 'owner' &&
            currentMember.role !== 'admin'
        ) {
            return res.status(403).json({
                message:
                    'Only admins and owners can edit attendance.'
            });
        }

        const attendanceRecord =
            community.attendance.id(
                attendanceId
            );

        if (!attendanceRecord) {
            return res.status(404).json({
                message:
                    'Attendance record not found.'
            });
        }

        attendanceRecord.status =
            status;

        attendanceRecord.markedBy =
            req.user.userId;

        attendanceRecord.updatedAt =
            new Date();

        await community.save();

        return res.status(200).json({
            message:
                'Attendance updated successfully.',
            attendance:
                attendanceRecord
        });

    } catch (error) {
        console.error(
            'Edit attendance error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to update attendance.'
        });
    }
}

/* =========================================
   LEAVE COMMUNITY
========================================= */

async function leaveCommunity(req, res) {
    try {
        const { communityId } = req.params;

        const community =
            await communityModel.findById(
                communityId
            );

        if (!community) {
            return res.status(404).json({
                message: 'Community not found.'
            });
        }

        const currentUserId =
            req.user.userId.toString();

        const currentMember =
            community.members.find(
                (member) =>
                    member.user &&
                    member.user.toString() ===
                        currentUserId
            );

        if (!currentMember) {
            return res.status(403).json({
                message:
                    'You are not a member of this community.'
            });
        }

        /* =====================================
           OWNER
        ====================================== */

        if (currentMember.role === 'owner') {

            /*
             * Owner can leave only when they
             * are the only member.
             */

            if (community.members.length > 1) {
                return res.status(400).json({
                    message:
                        'Owner cannot leave the community. Transfer ownership first.'
                });
            }

            /*
             * Owner is the only member,
             * so delete the entire community.
             */

            await communityModel.findByIdAndDelete(
                communityId
            );

            return res.status(200).json({
                message:
                    'Community deleted successfully.'
            });
        }

        /* =====================================
           MEMBER / ADMIN
        ====================================== */

        community.members =
            community.members.filter(
                (member) =>
                    member.user &&
                    member.user.toString() !==
                        currentUserId
            );

        await community.save();

        return res.status(200).json({
            message:
                'You have left the community successfully.'
        });

    } catch (error) {
        console.error(
            'Leave community error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to leave community.'
        });
    }
}


module.exports = {
    createCommunity,
    joinCommunity,
    getMyCommunities,
    getCommunity,
    getAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getMembers,
    promoteMember,
    makeOwner,
    removeMember,
    demoteMember,
    getAttendance,
    takeAttendance,
    editAttendance,
    leaveCommunity
};