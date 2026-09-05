import api from './api';

export const getNotifications = () => {
    return api.get('/notifications');
};

export const deleteNotification = (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
};