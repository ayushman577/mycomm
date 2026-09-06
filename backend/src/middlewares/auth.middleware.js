const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {

    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(' ')[1];

    /* =====================================================
       NO TOKEN
    ===================================================== */

    if (!token) {

        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });

    }


    try {

        /* =================================================
           VERIFY TOKEN
        ================================================= */

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        /* =================================================
           ATTACH USER DATA
        ================================================= */

        req.user = decoded;


        /* =================================================
           CONTINUE
        ================================================= */

        return next();

    } catch (error) {

        console.error(
            'AUTH MIDDLEWARE ERROR:',
            error.message
        );

        return res.status(401).json({
            message: 'Invalid or expired token.'
        });

    }
}

module.exports = {
    authMiddleware
};
