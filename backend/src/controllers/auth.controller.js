const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/email.service');
const otpModel = require('../models/otp.model');

async function registerUser(req, res) {

    console.log("🔥 REGISTER ROUTE HIT");
    console.log("BODY:", req.body);

    const {
        username,
        email,
        phone,
        password
    } = req.body;

    try {

        /* =====================================================
           CHECK EXISTING USER
        ===================================================== */

        console.log("1️⃣ Checking existing user...");

        const existingUser =
            await userModel.findOne({ email });

        console.log("2️⃣ Existing user checked");


        if (existingUser) {

            console.log("3️⃣ User already exists");

            if (!existingUser.emailVerified) {

                return res.status(400).json({
                    message:
                        'Email already registered. Please verify your email or request a new OTP.'
                });
            }

            return res.status(400).json({
                message: 'User already exists'
            });
        }


        /* =====================================================
           HASH PASSWORD
        ===================================================== */

        console.log("4️⃣ Hashing password...");

        const hashedPassword =
            await bcrypt.hash(password, 10);

        console.log("5️⃣ Password hashed");


        /* =====================================================
           CREATE NEW USER
        ===================================================== */

        console.log("6️⃣ Creating new user...");

        const user = new userModel({
            username,
            email,
            phone,
            password: hashedPassword,
            emailVerified: false
        });

        await user.save();

        console.log("7️⃣ NEW USER SAVED");


        /* =====================================================
           DELETE OLD OTPs
        ===================================================== */

        await otpModel.deleteMany({
            email
        });

        console.log("8️⃣ Old OTPs deleted");


        /* =====================================================
           GENERATE OTP
        ===================================================== */

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


        /* =====================================================
           SAVE OTP
        ===================================================== */

        const newOTP = new otpModel({
            email,
            otp,
            expiresAt: otpExpiry
        });

        console.log("9️⃣ Saving OTP...");

        await newOTP.save();

        console.log("🔟 OTP SAVED:", email);


        /* =====================================================
           SEND EMAIL
        ===================================================== */

        console.log("1️⃣1️⃣ Sending email...");

        await emailService.sendOTPEmail(
            email,
            otp
        );

        console.log(
            "1️⃣2️⃣ OTP EMAIL FUNCTION COMPLETED"
        );


        /* =====================================================
           SUCCESS
        ===================================================== */

        return res.status(201).json({
            message:
                'User registered successfully. Please verify your email with the OTP sent.'
        });

    } catch (error) {

        console.error(
            "🔥🔥 REGISTER ERROR 🔥🔥"
        );

        console.error(
            "ERROR:",
            error
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "STACK:",
            error.stack
        );

        return res.status(500).json({
            message: 'Failed to register user.'
        });
    }
}

async function loginUser(req, res) {

    const { email, password } = req.body;

    try {

        /* =====================================================
           FIND USER
        ===================================================== */

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }


        /* =====================================================
           CHECK PASSWORD
        ===================================================== */

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }


        /* =====================================================
           CHECK EMAIL VERIFICATION
        ===================================================== */

        if (!user.emailVerified) {

            return res.status(400).json({
                message:
                    'Please verify your email before logging in.'
            });
        }


        /* =====================================================
           CREATE JWT
        ===================================================== */

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );


        /* =====================================================
           SET COOKIE
        ===================================================== */

        res.cookie('token', token, {

            httpOnly: true,

            secure: true,

            sameSite: 'none',

            maxAge: 60 * 60 * 1000

        });


        /* =====================================================
           SUCCESS
        ===================================================== */

        return res.status(200).json({
            message: 'Login successful',
            token
        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message:
                'Something went wrong while logging in.'
        });
    }
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

    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return res.status(200).json({
            message: 'Logout successful'
        });

    } catch (error) {

        console.error('LOGOUT ERROR:', error);

        return res.status(500).json({
            message: 'Failed to logout.'
        });

    }
}


async function forgotPassword(req, res) {

    const { email } = req.body;

    try {

        if (!email?.trim()) {
            return res.status(400).json({
                message: 'Email address is required.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel.findOne({
            email: normalizedEmail
        });

        /*
         * Use a generic response so that people cannot
         * discover which email addresses are registered.
         */
        if (!user) {
            return res.status(200).json({
                message:
                    'If an account exists with this email, a password reset code has been sent.'
            });
        }

        /*
         * Only verified accounts can reset their password.
         */
        if (!user.emailVerified) {
            return res.status(400).json({
                message:
                    'Please verify your email before resetting your password.'
            });
        }

        /*
         * Generate OTP
         */
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

        /*
         * Remove previous OTP
         */
        await otpModel.deleteMany({
            email: normalizedEmail
        });

        /*
         * Save new OTP
         */
        const newOTP = new otpModel({
            email: normalizedEmail,
            otp,
            expiresAt: otpExpiry
        });

        await newOTP.save();

        /*
         * Send reset email
         */
        await emailService.resetPasswordEmail(
            normalizedEmail,
            otp
        );

        return res.status(200).json({
            message:
                'If an account exists with this email, a password reset code has been sent.'
        });

    } catch (error) {

        console.error(
            'FORGOT PASSWORD ERROR:',
            error
        );

        return res.status(500).json({
            message:
                'Unable to process password reset request.'
        });
    }
}

async function resetPassword(req, res) {

    const {
        email,
        otp,
        newPassword
    } = req.body;

    try {

        if (!email?.trim() || !otp || !newPassword) {

            return res.status(400).json({
                message:
                    'Email, OTP and new password are required.'
            });

        }

        if (newPassword.length < 6) {

            return res.status(400).json({
                message:
                    'New password must be at least 6 characters long.'
            });

        }

        const normalizedEmail =
            email.trim().toLowerCase();

        /*
         * Find OTP
         */
        const otpRecord =
            await otpModel.findOne({
                email: normalizedEmail,
                otp
            });

        if (!otpRecord) {

            return res.status(400).json({
                message:
                    'Invalid or expired OTP.'
            });

        }

        /*
         * Check expiry
         */
        if (
            otpRecord.expiresAt <
            new Date()
        ) {

            await otpModel.deleteOne({
                _id: otpRecord._id
            });

            return res.status(400).json({
                message:
                    'OTP has expired.'
            });

        }

        /*
         * Find user
         */
        const user =
            await userModel.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(400).json({
                message:
                    'Unable to reset password.'
            });

        }

        /*
         * Make sure the account is verified
         */
        if (!user.emailVerified) {

            return res.status(400).json({
                message:
                    'Please verify your email first.'
            });

        }

        /*
         * Hash new password
         */
        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );

        await user.save();

        /*
         * Delete OTP so it cannot be reused
         */
        await otpModel.deleteOne({
            _id: otpRecord._id
        });

        return res.status(200).json({
            message:
                'Password reset successfully.'
        });

    } catch (error) {

        console.error(
            'RESET PASSWORD ERROR:',
            error
        );

        return res.status(500).json({
            message:
                'Unable to reset password.'
        });
    }
}

async function resendOTP(req, res) {

    const { email } = req.body;

    try {

        /* =====================================================
           FIND USER
        ===================================================== */

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }


        /* =====================================================
           CHECK EMAIL VERIFICATION
        ===================================================== */

        if (user.emailVerified) {
            return res.status(400).json({
                message: 'Email is already verified. Please log in.'
            });
        }


        /* =====================================================
           GENERATE NEW OTP
        ===================================================== */

        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();

        const otpExpiry =
            new Date(
                Date.now() + 10 * 60 * 1000
            );


        /* =====================================================
           DELETE OLD OTP
        ===================================================== */

        await otpModel.deleteMany({
            email
        });


        /* =====================================================
           SAVE NEW OTP
        ===================================================== */

        const newOTP = new otpModel({
            email,
            otp,
            expiresAt: otpExpiry
        });

        await newOTP.save();


        /* =====================================================
           SEND EMAIL
        ===================================================== */

        await emailService.resendOTPEmail(
            email,
            otp
        );


        /* =====================================================
           SUCCESS
        ===================================================== */

        return res.status(200).json({
            message: 'OTP sent to your email'
        });

    } catch (error) {

        console.error("RESEND OTP ERROR:", error);

        return res.status(500).json({
            message: 'Failed to resend OTP. Please try again.'
        });
    }
}

async function getCurrentUser(req, res) {

    try {

        const userId = req.user.userId;

        const user = await userModel
            .findById(userId)
            .select('-password');

        if (!user) {

            return res.status(404).json({
                message: 'User not found.'
            });

        }

        return res.status(200).json({
            user
        });

    } catch (error) {

        console.error(
            'Error retrieving current user:',
            error
        );

        return res.status(500).json({
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