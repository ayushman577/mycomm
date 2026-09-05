const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'community',
            required: true
        },

        type: {
            type: String,
            enum: ['announcement'],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

const Notification = mongoose.model(
    'Notification',
    notificationSchema
);

module.exports = Notification;