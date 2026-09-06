const express = require('express');

const cors = require('cors');

const cookieParser = require('cookie-parser')

const authRouter = require('./routes/auth.route');

const communityRouter = require('./routes/community.route');

const notificationRoutes =
    require('./routes/notification.route');



const app = express();

app.use(express.json());

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));


app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use('/api/community', communityRouter);

app.use('/api/notifications', notificationRoutes);

module.exports = app;