import api from './api';

export const register = (payload) => api.post('/api/auth/register', payload);

export const verifyEmail = (payload) => api.post('/api/auth/verify-email', payload);

export const resendOTP = (payload) => api.post('/api/auth/resend-otp', payload);

export const login = (payload) => api.post('/api/auth/login', payload);

export const forgotPassword = (payload) => api.post('/api/auth/forgot-password', payload);

export const resetPassword = (payload) => api.post('/api/auth/reset-password', payload);

export const getCurrentUser = () => api.get('/api/auth/me');

export const getApiError = (error, fallback = 'Something went wrong. Please try again.') => (
    error.response?.data?.message || fallback
);

export const logout = () => api.post('/api/auth/logout');