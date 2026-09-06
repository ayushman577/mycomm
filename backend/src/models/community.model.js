const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
    {
        communityCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            match: /^[A-Z0-9]{6}$/
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ''
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                role: {
                    type: String,
                    enum: ['owner', 'admin', 'member'],
                    default: 'member'
                },

                joinedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        announcements: [
            {
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

                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                },

                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        events: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },

                place: {
                    type: String,
                    required: true,
                    trim: true
                },

                date: {
                    type: Date,
                    required: true
                },

                description: {
                    type: String,
                    trim: true,
                    default: ''
                },

                createdBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    default: null
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                },

                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        attendance: [
            {
                member: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                date: {
                    type: Date,
                    required: true
                },

                status: {
                    type: String,
                    enum: ['present', 'absent'],
                    required: true
                },

                markedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                },

                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);
const communityModel = mongoose.model('community', communitySchema);

module.exports = communityModel;