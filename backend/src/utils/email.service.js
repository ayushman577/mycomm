const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
}); 

const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            html: `YOUR EXISTING HTML HERE`
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("OTP EMAIL SENT:", info.messageId);

    } catch (error) {
        console.error("OTP EMAIL ERROR:", error);
        throw error;
    }
};

const resetPasswordEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your MyComm Password",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - MyComm</title>
        </head>

        <body style="margin:0; padding:0; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif; color:#111827;">

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fb; padding:45px 15px;">
                <tr>
                    <td align="center">

                        <table width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="max-width:580px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(17,24,39,0.08);">

                            <!-- Header -->
                            <tr>
                                <td align="center" style="padding:32px 30px; background:#111827;">
                                    <div style="font-size:30px; font-weight:800; color:#ffffff;">
                                        MyComm
                                    </div>

                                    <div style="margin-top:7px; font-size:13px; color:#9ca3af;">
                                        Your community, connected.
                                    </div>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:45px 42px 40px;">

                                    <h1 style="margin:0; text-align:center; font-size:27px; line-height:1.3; font-weight:700; color:#111827;">
                                        Reset your password
                                    </h1>

                                    <p style="margin:16px 0 32px; text-align:center; font-size:15px; line-height:1.7; color:#6b7280;">
                                        We received a request to reset your MyComm password.
                                        Use the verification code below to continue.
                                    </p>

                                    <!-- OTP -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center"
                                                style="padding:28px 20px; background:#eef2ff; border:2px solid #c7d2fe; border-radius:14px;">

                                                <div style="font-size:11px; font-weight:700; color:#4f46e5; text-transform:uppercase; letter-spacing:2px; margin-bottom:14px;">
                                                    Password Reset Code
                                                </div>

                                                <div style="font-size:42px; line-height:1; font-weight:800; letter-spacing:10px; color:#4338ca; padding-left:10px;">
                                                    ${otp}
                                                </div>

                                                <div style="margin-top:16px; font-size:12px; color:#6366f1;">
                                                    Valid for 10 minutes
                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Security Notice -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
                                        <tr>
                                            <td style="padding:16px 18px; background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb;">

                                                <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center;">
                                                    🔒 For your security, never share this code with anyone.
                                                </p>

                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin:28px 0 0; text-align:center; font-size:13px; line-height:1.6; color:#9ca3af;">
                                        If you didn't request a password reset, you can safely ignore this email.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center"
                                    style="padding:22px 30px; background:#f9fafb; border-top:1px solid #e5e7eb;">

                                    <p style="margin:0; font-size:12px; color:#9ca3af;">
                                        © ${new Date().getFullYear()} MyComm
                                    </p>

                                    <p style="margin:6px 0 0; font-size:11px; color:#b0b7c3;">
                                        This is an automated message. Please do not reply.
                                    </p>

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

const resendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code - Resend",
        html: `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Verify your email - MyComm</title> </head> <body style=" margin: 0; padding: 0; background: #f5f7fb; font-family: Inter, Arial, Helvetica, sans-serif; color: #111827; "> <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fb; padding:45px 15px;"> <tr> <td align="center"> <!-- Main Card --> <table width="100%" cellpadding="0" cellspacing="0" border="0" style
=" max-width:580px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(17,24,39,0.08); "> <!-- Header --> <tr> <td align="center" style=" padding:32px 30px; background:#111827; "> <div style=" font-size:30px; font-weight:800; letter-spacing:-1px; color:#ffffff; "> MyComm </div> <div style=" margin-top:7px; font-size:13px; font-weight:400; color:#9ca3af; letter-spacing:0.3px; "> Your community, connected. </div> </td> </tr> <!-- Body --> <tr> <td style="padding:45px 42px 40px;"> <h1 style=" margin:0; text-align:center; font-size:27px; line-height:1.3; font-weight:700; letter-spacing:-0.5px; color:#111827; "> Verify your email </h1> <p style=" margin:16px 0 32px; text-align:center; font-size:15px; line-height:1.7; color:#6b7280; "> You requested to resend the verification code. Use the code below to confirm your email address. </p> <!-- OTP Highlight --> <table width="100%" cellpadding="0" cellspacing="0" border="0"> <tr> <td align="center" style=" padding:28px 20px; background:#eef2ff; border:2px solid #c7d2fe; border-radius:14px; "> <div style=" font-size:11px; font-weight:700; color:#4f46e5; text-transform:uppercase; letter-spacing:2px; margin-bottom:14px; "> Your Verification Code </div> <div style=" font-size:42px; line-height:1; font-weight:800; letter-spacing:10px; color:#4338ca; padding-left:10px; "> ${otp} </div> <div style=" margin-top:16px; font-size:12px; color:#6366f1;"> Valid for 10 minutes </div> </td> </tr> </table> <!-- Security Notice --> <table width="100%" cellpadding="0" cellspacing="
0" border="0" style="margin-top:30px;"> <tr> <td style=" padding:16px 18px; background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb; "> <p style=" margin:0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center; "> 🔒 For your security, never share this verification code with anyone. </p> </td> </tr> </table> <p style=" margin:28px 0 0; text-align:center; font-size:13px; line-height:1.6; color:#9ca3af; "> If you didn't request this code, you can safely ignore this email. </p> </td> </tr> <!-- Footer --> <tr> <td align="center" style=" padding:22px 30px; background:#f9fafb; border-top:1px solid #e5e7eb; "> <p style=" margin:0; font-size:12px; color:#9ca3af; "> © ${new Date().getFullYear()} MyComm </p> <p style=" margin:6px 0 0; font-size:11px; color:#b0b7c3; "> This is an automated message. Please do not reply. </p> </td> </tr> </table> </td> </tr> </table> </body> </html>
        `
    };
    await transporter.sendMail(mailOptions);
}

const sendAnnouncementEmail = async (
    email,
    communityName,
    title,
    message
) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `New Announcement - ${communityName}`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >
            <title>New Announcement - MyComm</title>
        </head>

        <body style="
            margin:0;
            padding:0;
            background:#f5f7fb;
            font-family:Arial, Helvetica, sans-serif;
            color:#111827;
        ">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background:#f5f7fb; padding:45px 15px;"
            >
                <tr>
                    <td align="center">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                max-width:580px;
                                background:#ffffff;
                                border-radius:16px;
                                overflow:hidden;
                                box-shadow:0 8px 30px rgba(17,24,39,0.08);
                            "
                        >

                            <!-- Header -->
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding:32px 30px;
                                        background:#111827;
                                    "
                                >
                                    <div style="
                                        font-size:30px;
                                        font-weight:800;
                                        color:#ffffff;
                                    ">
                                        MyComm
                                    </div>

                                    <div style="
                                        margin-top:7px;
                                        font-size:13px;
                                        color:#9ca3af;
                                    ">
                                        Your community, connected.
                                    </div>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:42px 40px 38px;">

                                    <p style="
                                        margin:0 0 10px;
                                        text-align:center;
                                        font-size:13px;
                                        color:#6b7280;
                                    ">
                                        New announcement in
                                        <strong style="color:#111827;">
                                            ${communityName}
                                        </strong>
                                    </p>

                                    <h1 style="
                                        margin:0 0 18px;
                                        text-align:center;
                                        font-size:27px;
                                        line-height:1.3;
                                        font-weight:700;
                                        color:#111827;
                                    ">
                                        ${title}
                                    </h1>

                                    <div style="
                                        padding:22px 20px;
                                        background:#f9fafb;
                                        border:1px solid #e5e7eb;
                                        border-radius:12px;
                                    ">
                                        <p style="
                                            margin:0;
                                            font-size:15px;
                                            line-height:1.7;
                                            color:#4b5563;
                                        ">
                                            ${message}
                                        </p>
                                    </div>

                                    <p style="
                                        margin:26px 0 0;
                                        text-align:center;
                                        font-size:13px;
                                        line-height:1.6;
                                        color:#9ca3af;
                                    ">
                                        Log in to MyComm to view this
                                        announcement and stay updated with
                                        your community.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding:22px 30px;
                                        background:#f9fafb;
                                        border-top:1px solid #e5e7eb;
                                    "
                                >
                                    <p style="
                                        margin:0;
                                        font-size:12px;
                                        color:#9ca3af;
                                    ">
                                        © ${new Date().getFullYear()} MyComm
                                    </p>

                                    <p style="
                                        margin:6px 0 0;
                                        font-size:11px;
                                        color:#b0b7c3;
                                    ">
                                        This is an automated message.
                                        Please do not reply.
                                    </p>
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, resetPasswordEmail, resendOTPEmail, sendAnnouncementEmail };