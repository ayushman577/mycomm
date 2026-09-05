import api from './api';

export const getProfile = () => {
    return api.get('/auth/me');
};

export const updateProfile = (data) => {
    return api.put('/auth/profile', data);
};

export const changePassword = (data) => {
    return api.put('/auth/change-password', data);
};