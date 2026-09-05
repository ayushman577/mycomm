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
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies) to be sent
}));


app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/community', communityRouter);
app.use('/api/notifications', notificationRoutes);

module.exports = app;