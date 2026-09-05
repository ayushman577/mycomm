const express = require('express');

const cors = require('cors');

const cookieParser = require('cookie-parser')

const authRouter = require('./routes/auth.route');

const communityRouter = require('./routes/community.route');

const notificationRoutes =
    require('./routes/notification.route');



const app = express();

app.use(express.json());

app.use(cors({
    origin: 'https://mycomm-chi.vercel.app',
    credentials: true,
}));


app.use(cookieParser());

app.use('/api/auth', authRouter);

app.use('/api/community', communityRouter);

app.use('/api/notifications', notificationRoutes);

module.exports = app;