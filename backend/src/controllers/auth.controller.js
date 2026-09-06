const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/email.service');
const otpModel = require('../models/otp.model');

async function registerUser(req, res) {
    const {
        username,
        email,
        phone,
        password
    } = req.body;

    try {
        const existingUser =
            await userModel.findOne({ email });

        if (
            existingUser &&
            existingUser.emailVerified
        ) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username,
            email,
            phone,
            password: hashedPassword,
            emailVerified: false
        });

        await newUser.save();

        await otpModel.deleteMany({
            email
        });

        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();

        const otpExpiry =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        const newOTP = new otpModel({
            email,
            otp,
            expiresAt: otpExpiry
        });

        await newOTP.save();
        console.log("OTP SAVED:", email);

        await emailService.sendOTPEmail(
            email,
            otp
        );
        console.log("OTP EMAIL FUNCTION COMPLETED");

        return res.status(201).json({
            message:
                'User registered successfully. Please verify your email with the OTP sent.'
        });

    } catch (error) {
        console.error(
            'Register user error:',
            error
        );

        return res.status(500).json({
            message:
                'Failed to register user.'
        });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
        return res.status(400).json({
            message: 'Please verify your email before logging in.'
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000
    });

    res.json({ token });
}

async function verifyEmail(req, res) {
    const { email, otp } = req.body;

    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
        await otpModel.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: 'OTP has expired' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    user.emailVerified = true;
    await user.save();

    await otpModel.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Email verified successfully' });
}

async function logoutUser(req, res) {

    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    res.json({
        message: 'Logged out successfully.'
    });
}

async function forgotPassword(req, res) {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Generate a new OTP and save it
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await otpModel.deleteMany({ email }); // Remove any existing OTPs for this email

    const newOTP = new otpModel({
        email,
        otp,
        expiresAt: otpExpiry
    });

    await newOTP.save();

    // Send the OTP via email
    await emailService.resetPasswordEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
}

async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
        await otpModel.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ message: 'OTP has expired' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete the used OTP
    await otpModel.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successfully' });
}

async function resendOTP(req, res) {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Generate a new OTP and save it
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await otpModel.deleteMany({ email }); // Remove any existing OTPs for this email

    const newOTP = new otpModel({
        email,
        otp,
        expiresAt: otpExpiry
    });

    await newOTP.save();

    // Send the OTP via email
    await emailService.resendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
}

async function getCurrentUser(req, res) {
    try {
        const userId = req.user.userId;
        const user = await userModel.findById(userId).select('-password'); // Exclude password from the response
        res.json({ user });
    } catch (error) {
        console.error('Error retrieving current user:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current password and new password are required.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'New password must be at least 6 characters long.'
            });
        }

        const user = await userModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect.'
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                message: 'New password must be different from the current password.'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        return res.status(200).json({
            message: 'Password changed successfully.'
        });

    } catch (error) {
        console.error('Change password error:', error);

        return res.status(500).json({
            message: 'Failed to change password.'
        });
    }
}

async function updateProfile(req, res) {
    try {
        const { username, phone } = req.body;

        if (!username?.trim()) {
            return res.status(400).json({
                message: 'Username is required.'
            });
        }

        const user = await userModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const existingUser = await userModel.findOne({
            username: username.trim(),
            _id: { $ne: user._id }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Username is already taken.'
            });
        }

        user.username = username.trim();
        user.phone = phone?.trim() || '';

        await user.save();

        const updatedUser = await userModel
            .findById(user._id)
            .select('-password');

        return res.status(200).json({
            message: 'Profile updated successfully.',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);

        return res.status(500).json({
            message: 'Failed to update profile.'
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    logoutUser,
    forgotPassword,
    resetPassword,
    resendOTP,
    getCurrentUser,
    changePassword,
    updateProfile
};