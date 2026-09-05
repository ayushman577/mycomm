import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getNotifications,
    deleteNotification
} from '../services/notificationService';

function Notifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getNotifications();
            setNotifications(response?.data?.notifications || []);
        } catch (err) {
            console.error('Get notifications error:', err);
            setError(err?.response?.data?.message || 'Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleOpenNotification = async (notification) => {
        try {
            await deleteNotification(notification._id);

            setNotifications((previous) =>
                previous.filter((item) => item._id !== notification._id)
            );

            navigate(`/community/${notification.community._id}`);
        } catch (err) {
            console.error('Open notification error:', err);
            alert(err?.response?.data?.message || 'Failed to open notification.');
        }
    };

    if (loading) {
        return (
            <main className="notifications-page dashboard-loading-state">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
            </main>
        );
    }

    return (
        <main className="notifications-page">
            <div className="notifications-container">

                <header className="notifications-header">
                    <div>
                        <h1>Notifications</h1>
                        <p>Stay up to date with community announcements and updates.</p>
                    </div>

                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => navigate('/dashboard')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Dashboard
                    </button>
                </header>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {!error && notifications.length === 0 && (
                    <div className="notifications-empty">
                        <div className="empty-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </div>
                        <h2>You're All Caught Up</h2>
                        <p>There are no new notifications or announcements right now.</p>
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="notifications-list">
                        {notifications.map((notification) => (
                            <button
                                key={notification._id}
                                type="button"
                                className="notification-card"
                                onClick={() => handleOpenNotification(notification)}
                            >
                                <div className="notification-card-top">
                                    <span className="notification-type-badge">
                                        Announcement
                                    </span>

                                    <span className="notification-community">
                                        {notification.community?.name || 'Community'}
                                    </span>
                                </div>

                                <h2>{notification.title}</h2>
                                <p>{notification.message}</p>

                                <div className="notification-card-footer">
                                    <span className="notification-open">
                                        View Community
                                    </span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}

export default Notifications;