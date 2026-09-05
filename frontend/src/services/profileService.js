import api from './api';

export const getProfile = () => {

    return api.get('/api/auth/me');

};

export const updateProfile = (data) => {

    return api.put('/api/auth/profile', data);

};

export const changePassword = (data) => {

    return api.put('/api/auth/change-password', data);

};