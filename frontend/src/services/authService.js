import api from './api';

export const register = (payload) => api.post('/auth/register', payload);
export const verifyEmail = (payload) => api.post('/auth/verify-email', payload);
export const resendOTP = (payload) => api.post('/auth/resend-otp', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload);
export const getCurrentUser = () => api.get('/auth/me'); 

export const getApiError = (error, fallback = 'Something went wrong. Please try again.') => (
    error.response?.data?.message || fallback
);

export const logout = () => api.post('/auth/logout');
