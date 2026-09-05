import api from './api';

export const getNotifications = () => {
    return api.get('/api/notifications');
};

export const deleteNotification = (notificationId) => {
    return api.delete(`/api/notifications/${notificationId}`);
};