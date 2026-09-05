import api from './api';

export const getMyCommunities = () => api.get('/api/community/my');

export const createCommunity = (payload) =>
    api.post('/api/community/create', payload);

export const joinCommunity = (payload) =>
    api.post('/api/community/join', payload);

export const getCommunity = (communityId) => {
    return api.get(`/api/community/${communityId}`);
};

export const getAnnouncements = (communityId) => {
    return api.get(`/api/community/${communityId}/announcements`);
};

export const addAnnouncement = (communityId, data) => {
    return api.post(
        `/api/community/${communityId}/announcements`,
        data
    );
};

export const updateAnnouncement = (
    communityId,
    announcementId,
    data
) => {
    return api.put(
        `/api/community/${communityId}/announcements/${announcementId}`,
        data
    );
};

export const deleteAnnouncement = (communityId, announcementId) => {
    return api.delete(
        `/api/community/${communityId}/announcements/${announcementId}`
    );
};

export const getEvents = (communityId) => {
    return api.get(`/api/community/${communityId}/events`);
};

export const addEvent = (communityId, data) => {
    return api.post(
        `/api/community/${communityId}/events`,
        data
    );
};

export const updateEvent = (
    communityId,
    eventId,
    data
) => {
    return api.put(
        `/api/community/${communityId}/events/${eventId}`,
        data
    );
};

export const deleteEvent = (
    communityId,
    eventId
) => {
    return api.delete(
        `/api/community/${communityId}/events/${eventId}`
    );
};

export const getMembers = (communityId) => {
    return api.get(`/api/community/${communityId}/members`);
};

export const promoteMember = (communityId, memberId) => {
    return api.put(
        `/api/community/${communityId}/members/${memberId}/promote`
    );
};

export const makeOwner = (communityId, memberId) => {
    return api.put(
        `/api/community/${communityId}/members/${memberId}/make-owner`
    );
};

export const removeMember = (communityId, memberId) => {
    return api.delete(
        `/api/community/${communityId}/members/${memberId}`
    );
};

export const demoteMember = (communityId, memberId) => {
    return api.put(
        `/api/community/${communityId}/members/${memberId}/demote`
    );
};

/* =========================================
   ATTENDANCE
========================================= */

export const getAttendance = (
    communityId,
    params = {}
) => {
    return api.get(
        `/api/community/${communityId}/attendance`,
        {
            params
        }
    );
};

export const takeAttendance = (
    communityId,
    data
) => {
    return api.post(
        `/api/community/${communityId}/attendance`,
        data
    );
};

export const editAttendance = (
    communityId,
    attendanceId,
    data
) => {
    return api.put(
        `/api/community/${communityId}/attendance/${attendanceId}`,
        data
    );
};

/* =========================================
   LEAVE COMMUNITY
========================================= */

export const leaveCommunity = (
    communityId
) => {
    return api.delete(
        `/api/community/${communityId}/leave`
    );
};