const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

/* =========================================================
   COMMON EMAIL SENDER
========================================================= */

const sendEmail = async ({ to, subject, html }) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: "MyComm",
                email: process.env.EMAIL_FROM
            },
            to: [
                {
                    email: to
                }
            ],
            subject,
            htmlContent: html
        });

        console.log("EMAIL SENT:", result);
        return result;
    } catch (error) {
        console.error("BREVO EMAIL ERROR:", error);
        console.error("MESSAGE:", error.message);
        console.error("STATUS:", error.statusCode);
        throw error;
    }
};

/* =========================================================
   OTP EMAIL
========================================================= */

const sendOTPEmail = async (email, otp) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email - MyComm</title>
        </head>
        <body style="margin:0; padding:0; background-color:#050505; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505; padding:45px 15px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#0d0d0f; border:1px solid #222228; border-radius:14px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.85);">
                            <!-- TOP NEON ACCENT STRIP -->
                            <tr>
                                <td height="3" style="background-color:#ff3333; font-size:1px; line-height:3px;">&nbsp;</td>
                            </tr>
                            <!-- HEADER -->
                            <tr>
                                <td align="center" style="padding:36px 30px 28px; background-color:#09090b; border-bottom:1px solid #1f1f24;">
                                    <div style="font-size:26px; line-height:1; font-weight:800; letter-spacing:-0.5px; color:#ffffff;">
                                        My<span style="color:#ff3333;">Comm</span>
                                    </div>
                                    <div style="margin-top:8px; font-size:12px; color:#71717a; letter-spacing:0.4px; text-transform:uppercase; font-weight:600;">
                                        Workspace Roster & Coordination
                                    </div>
                                </td>
                            </tr>
                            <!-- BODY -->
                            <tr>
                                <td style="padding:38px 36px 32px;">
                                    <div style="text-align:center; margin-bottom:16px;">
                                        <span style="display:inline-block; padding:4px 12px; background-color:#16161a; border:1px solid #27272f; border-radius:6px; font-size:10px; font-weight:700; color:#ff3333; text-transform:uppercase; letter-spacing:1.5px;">
                                            Identity Verification
                                        </span>
                                    </div>
                                    <h1 style="margin:0 0 12px; text-align:center; font-size:24px; line-height:1.3; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">
                                        Verify your email address
                                    </h1>
                                    <p style="margin:0 0 28px; text-align:center; font-size:14px; line-height:1.6; color:#a1a1aa;">
                                        Use the verification code below to authorize your MyComm identity and finalize access.
                                    </p>
                                    <!-- OTP BOX -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center" style="padding:28px 20px; background-color:#050506; border:1px solid #222228; border-radius:10px;">
                                                <div style="font-size:10px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                                                    One-Time Security Key
                                                </div>
                                                <div style="font-size:38px; line-height:1; font-weight:800; letter-spacing:10px; color:#ffffff; padding-left:10px; font-family:'SF Pro Display', -apple-system, monospace;">
                                                    ${otp}
                                                </div>
                                                <div style="margin-top:14px; font-size:12px; color:#a1a1aa;">
                                                    Valid for <span style="color:#ff3333; font-weight:600;">10 minutes</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- SECURITY NOTICE -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                        <tr>
                                            <td style="padding:14px 16px; background-color:#09090b; border:1px solid #1a1a1f; border-radius:8px;">
                                                <p style="margin:0; text-align:center; font-size:12px; line-height:1.5; color:#71717a;">
                                                    <strong style="color:#e4e4e7;">Security check:</strong> Never share this temporary code with anyone. MyComm administrators will never solicit your code.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin:22px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#52525b;">
                                        If you did not initiate this request, you can safely disregard this notification.
                                    </p>
                                </td>
                            </tr>
                            <!-- FOOTER -->
                            <tr>
                                <td align="center" style="padding:20px 30px; background-color:#09090b; border-top:1px solid #1f1f24;">
                                    <p style="margin:0; font-size:11px; color:#71717a;">
                                        &copy; ${new Date().getFullYear()} MyComm Platform. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        return await sendEmail({
            to: email,
            subject: "Your MyComm Verification Code",
            html
        });
    } catch (error) {
        console.error("OTP EMAIL ERROR:", error);
        throw error;
    }
};

/* =========================================================
   RESET PASSWORD EMAIL
========================================================= */

const resetPasswordEmail = async (email, otp) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - MyComm</title>
        </head>
        <body style="margin:0; padding:0; background-color:#050505; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505; padding:45px 15px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#0d0d0f; border:1px solid #222228; border-radius:14px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.85);">
                            <!-- TOP NEON ACCENT STRIP -->
                            <tr>
                                <td height="3" style="background-color:#ff3333; font-size:1px; line-height:3px;">&nbsp;</td>
                            </tr>
                            <!-- HEADER -->
                            <tr>
                                <td align="center" style="padding:36px 30px 28px; background-color:#09090b; border-bottom:1px solid #1f1f24;">
                                    <div style="font-size:26px; line-height:1; font-weight:800; letter-spacing:-0.5px; color:#ffffff;">
                                        My<span style="color:#ff3333;">Comm</span>
                                    </div>
                                    <div style="margin-top:8px; font-size:12px; color:#71717a; letter-spacing:0.4px; text-transform:uppercase; font-weight:600;">
                                        Account Credential Recovery
                                    </div>
                                </td>
                            </tr>
                            <!-- BODY -->
                            <tr>
                                <td style="padding:38px 36px 32px;">
                                    <div style="text-align:center; margin-bottom:16px;">
                                        <span style="display:inline-block; padding:4px 12px; background-color:#16161a; border:1px solid #27272f; border-radius:6px; font-size:10px; font-weight:700; color:#ff3333; text-transform:uppercase; letter-spacing:1.5px;">
                                            Security Request
                                        </span>
                                    </div>
                                    <h1 style="margin:0 0 12px; text-align:center; font-size:24px; line-height:1.3; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">
                                        Reset your password
                                    </h1>
                                    <p style="margin:0 0 28px; text-align:center; font-size:14px; line-height:1.6; color:#a1a1aa;">
                                        A request was made to update your credentials. Enter the authentication code below to choose a new password.
                                    </p>
                                    <!-- OTP BOX -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center" style="padding:28px 20px; background-color:#050506; border:1px solid #222228; border-radius:10px;">
                                                <div style="font-size:10px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                                                    Password Recovery Key
                                                </div>
                                                <div style="font-size:38px; line-height:1; font-weight:800; letter-spacing:10px; color:#ffffff; padding-left:10px; font-family:'SF Pro Display', -apple-system, monospace;">
                                                    ${otp}
                                                </div>
                                                <div style="margin-top:14px; font-size:12px; color:#a1a1aa;">
                                                    Expires in <span style="color:#ff3333; font-weight:600;">10 minutes</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- SECURITY NOTICE -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                                        <tr>
                                            <td style="padding:14px 16px; background-color:#09090b; border:1px solid #1a1a1f; border-radius:8px;">
                                                <p style="margin:0; text-align:center; font-size:12px; line-height:1.5; color:#71717a;">
                                                    If you did not initiate a password reset, someone may be attempting to access your account. Please notify your administrator immediately.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- FOOTER -->
                            <tr>
                                <td align="center" style="padding:20px 30px; background-color:#09090b; border-top:1px solid #1f1f24;">
                                    <p style="margin:0; font-size:11px; color:#71717a;">
                                        &copy; ${new Date().getFullYear()} MyComm Platform. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        return await sendEmail({
            to: email,
            subject: "Reset Your MyComm Password",
            html
        });
    } catch (error) {
        console.error("RESET PASSWORD EMAIL ERROR:", error);
        throw error;
    }
};

/* =========================================================
   RESEND OTP EMAIL
========================================================= */

const resendOTPEmail = async (email, otp) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your new verification code - MyComm</title>
        </head>
        <body style="margin:0; padding:0; background-color:#050505; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505; padding:45px 15px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#0d0d0f; border:1px solid #222228; border-radius:14px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.85);">
                            <!-- TOP NEON ACCENT STRIP -->
                            <tr>
                                <td height="3" style="background-color:#ff3333; font-size:1px; line-height:3px;">&nbsp;</td>
                            </tr>
                            <!-- HEADER -->
                            <tr>
                                <td align="center" style="padding:36px 30px 28px; background-color:#09090b; border-bottom:1px solid #1f1f24;">
                                    <div style="font-size:26px; line-height:1; font-weight:800; letter-spacing:-0.5px; color:#ffffff;">
                                        My<span style="color:#ff3333;">Comm</span>
                                    </div>
                                    <div style="margin-top:8px; font-size:12px; color:#71717a; letter-spacing:0.4px; text-transform:uppercase; font-weight:600;">
                                        Reissued Authentication
                                    </div>
                                </td>
                            </tr>
                            <!-- BODY -->
                            <tr>
                                <td style="padding:38px 36px 32px;">
                                    <div style="text-align:center; margin-bottom:16px;">
                                        <span style="display:inline-block; padding:4px 12px; background-color:#16161a; border:1px solid #27272f; border-radius:6px; font-size:10px; font-weight:700; color:#ff3333; text-transform:uppercase; letter-spacing:1.5px;">
                                            New Authorization Key
                                        </span>
                                    </div>
                                    <h1 style="margin:0 0 12px; text-align:center; font-size:24px; line-height:1.3; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">
                                        Here is your new code
                                    </h1>
                                    <p style="margin:0 0 28px; text-align:center; font-size:14px; line-height:1.6; color:#a1a1aa;">
                                        You requested a replacement authorization key for your MyComm account. Previous keys have been invalidated.
                                    </p>
                                    <!-- OTP BOX -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center" style="padding:28px 20px; background-color:#050506; border:1px solid #222228; border-radius:10px;">
                                                <div style="font-size:10px; font-weight:700; color:#71717a; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">
                                                    Fresh Security Key
                                                </div>
                                                <div style="font-size:38px; line-height:1; font-weight:800; letter-spacing:10px; color:#ffffff; padding-left:10px; font-family:'SF Pro Display', -apple-system, monospace;">
                                                    ${otp}
                                                </div>
                                                <div style="margin-top:14px; font-size:12px; color:#a1a1aa;">
                                                    Expires in <span style="color:#ff3333; font-weight:600;">10 minutes</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin:26px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#52525b;">
                                        If this request was not submitted by you, please secure your account credentials.
                                    </p>
                                </td>
                            </tr>
                            <!-- FOOTER -->
                            <tr>
                                <td align="center" style="padding:20px 30px; background-color:#09090b; border-top:1px solid #1f1f24;">
                                    <p style="margin:0; font-size:11px; color:#71717a;">
                                        &copy; ${new Date().getFullYear()} MyComm Platform. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        return await sendEmail({
            to: email,
            subject: "Your New MyComm Verification Code",
            html
        });
    } catch (error) {
        console.error("RESEND OTP EMAIL ERROR:", error);
        throw error;
    }
};

/* =========================================================
   ANNOUNCEMENT EMAIL
========================================================= */

const sendAnnouncementEmail = async (email, communityName, title, message) => {
    try {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Announcement - MyComm</title>
        </head>
        <body style="margin:0; padding:0; background-color:#050505; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505; padding:45px 15px;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; background-color:#0d0d0f; border:1px solid #222228; border-radius:14px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.85);">
                            <!-- TOP NEON ACCENT STRIP -->
                            <tr>
                                <td height="3" style="background-color:#ff3333; font-size:1px; line-height:3px;">&nbsp;</td>
                            </tr>
                            <!-- HEADER -->
                            <tr>
                                <td align="center" style="padding:34px 30px 26px; background-color:#09090b; border-bottom:1px solid #1f1f24;">
                                    <div style="font-size:26px; line-height:1; font-weight:800; letter-spacing:-0.5px; color:#ffffff;">
                                        My<span style="color:#ff3333;">Comm</span>
                                    </div>
                                    <div style="margin-top:8px; font-size:12px; color:#71717a; letter-spacing:0.4px; text-transform:uppercase; font-weight:600;">
                                        Community Bulletin
                                    </div>
                                </td>
                            </tr>
                            <!-- BODY -->
                            <tr>
                                <td style="padding:36px 36px 32px;">
                                    <div style="text-align:center; margin-bottom:12px;">
                                        <span style="display:inline-block; padding:4px 12px; background-color:#16161a; border:1px solid #27272f; border-radius:6px; font-size:11px; font-weight:600; color:#71717a;">
                                            Channel: <strong style="color:#ffffff;">${communityName}</strong>
                                        </span>
                                    </div>
                                    <h1 style="margin:0 0 20px; text-align:center; font-size:22px; line-height:1.3; font-weight:700; color:#ffffff; letter-spacing:-0.3px;">
                                        ${title}
                                    </h1>
                                    <!-- MESSAGE BOX -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="padding:22px 24px; background-color:#050506; border-left:3px solid #ff3333; border-top:1px solid #1f1f24; border-right:1px solid #1f1f24; border-bottom:1px solid #1f1f24; border-radius:8px;">
                                                <p style="margin:0; font-size:14px; line-height:1.7; color:#d4d4d8; white-space:pre-wrap;">
                                                    ${message}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin:26px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#71717a;">
                                        Log in to the MyComm dashboard to interact and view related threads.
                                    </p>
                                </td>
                            </tr>
                            <!-- FOOTER -->
                            <tr>
                                <td align="center" style="padding:20px 30px; background-color:#09090b; border-top:1px solid #1f1f24;">
                                    <p style="margin:0; font-size:11px; color:#71717a;">
                                        &copy; ${new Date().getFullYear()} MyComm Platform. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        return await sendEmail({
            to: email,
            subject: `[${communityName}] ${title}`,
            html
        });
    } catch (error) {
        console.error("ANNOUNCEMENT EMAIL ERROR:", error);
        throw error;
    }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    sendOTPEmail,
    resetPasswordEmail,
    resendOTPEmail,
    sendAnnouncementEmail
};