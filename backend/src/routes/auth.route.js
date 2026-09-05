const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Define your authentication routes here
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);
router.get('/me', authMiddleware.authMiddleware, authController.getCurrentUser);
router.put(
    '/change-password',
    authMiddleware.authMiddleware,
    authController.changePassword
);

router.put(
    '/profile',
    authMiddleware.authMiddleware,
    authController.updateProfile
);

module.exports = router;